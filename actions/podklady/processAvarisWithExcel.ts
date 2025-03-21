// app/actions/podklady/processAvarisWithExcel.ts
"use server";

import { StructuredLogger } from "@/modules/podklady/services/structuredLogger";
import { captureAvarisData } from "@/modules/podklady/services/scraper";
import { processAvarisData } from "@/modules/podklady/services/csvProcessor";
import { writeFile, mkdir, readFile, access } from "fs/promises";
import path from "path";
import { processExcelSheet } from "./enhancedSheetProcessor";
import { runAdvancedProcessing } from "./advancedExcelProcessing";
import ExcelJS from "exceljs";

// Inicializace StructuredLogger místo starého createLogger
const logger = StructuredLogger.getInstance().getComponentLogger('avaris-excel-action');

export type AvarisExcelResult = {
  success: boolean;
  error?: string;
  reportData?: {
    dataAdded?: number;
    message?: string;
    nameComparisonReport?: string;
    timeUpdateReport?: string;
    consecutiveShiftsReport?: string;
    consecutiveShiftsCount?: number;
  };
  finalFilePath?: string;
};

export type ProcessingOptions = {
  compareNames?: boolean;
  updateTimes?: boolean;
  detectConsecutiveShifts?: boolean;
};

function formatDateString(dateStr: string): string {
    if (!dateStr) return "";
    
    // Zkontrolujeme, zda formát odpovídá očekávanému "YYYY-MM-DD"
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [_, year, month, day] = match;
      return `${day}.${month}.${year}`;
    }
    
    // Pokud je datum již ve správném formátu nebo v jiném formátu, vrátíme ho beze změny
    return dateStr;
}

/**
 * Funkce pro kontrolu existence souboru
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Serverová akce pro zpracování Excel souboru s daty z Avarisu
 * @param formData Formulářová data od uživatele
 * @param options Možnosti zpracování (porovnání jmen, aktualizace časů, detekce navazujících směn)
 */
export async function processAvarisWithExcel(
  formData: FormData,
  options: ProcessingOptions = {}
): Promise<AvarisExcelResult> {
  // Generujeme korelační ID pro sledování této operace
  const correlationId = `process_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  logger.setCorrelationId(correlationId);
  
  try {
    logger.info(
      "Zpracovávám požadavek na integraci Avaris dat do Excel souboru", {
        formDataEntries: Array.from(formData.keys())
      }
    );

    // Výchozí možnosti zpracování, pokud nejsou explicitně stanoveny
    const processingOptions: ProcessingOptions = {
      compareNames: options.compareNames !== undefined ? options.compareNames : true,
      updateTimes: options.updateTimes !== undefined ? options.updateTimes : true,
      detectConsecutiveShifts: options.detectConsecutiveShifts !== undefined ? options.detectConsecutiveShifts : true
    };

    // Zkusíme načíst možnosti zpracování z formData, pokud byly předány
    const optionsFromForm = formData.get("options");
    if (optionsFromForm) {
      try {
        const parsedOptions = JSON.parse(optionsFromForm as string);
        if (parsedOptions) {
          processingOptions.compareNames = parsedOptions.compareNames !== undefined ? parsedOptions.compareNames : processingOptions.compareNames;
          processingOptions.updateTimes = parsedOptions.updateTimes !== undefined ? parsedOptions.updateTimes : processingOptions.updateTimes;
          processingOptions.detectConsecutiveShifts = parsedOptions.detectConsecutiveShifts !== undefined ? parsedOptions.detectConsecutiveShifts : processingOptions.detectConsecutiveShifts;
        }
      } catch (error) {
        logger.warn(`Chyba při parsování možností zpracování: ${error}. Používám výchozí hodnoty.`, {
          optionsString: optionsFromForm,
          error: error instanceof Error ? error.message : 'Neznámá chyba'
        });
      }
    }

    logger.info(`Možnosti zpracování: ${JSON.stringify(processingOptions)}`, { processingOptions });

    // Krok 1: Načtení parametrů z formuláře
    // Použití proměnných prostředí pro přihlašovací údaje, s fallback hodnotami
    const ico = process.env.AVARIS_ICO || "25790668";
    const username = process.env.AVARIS_USERNAME || "reditel@ares-group.cz";
    const password = process.env.AVARIS_PASSWORD || "slunicko";

    // Získání nahraného souboru
    const fileName = formData.get("fileName") as string;

    if (!fileName) {
      logger.warn("Nebyl nahrán žádný soubor");
      return {
        success: false,
        error: "Nebyl nahrán žádný soubor",
      };
    }

    // Získání objektů
    const objektInput = (formData.get("objekty") as string) || "";
    const objektNames = objektInput
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (objektNames.length === 0) {
      logger.warn('Nebyly zadány žádné objekty, používám výchozí "RENOCAR"');
      objektNames.push("RENOCAR");
    }

    // Získání datumů
    const today = new Date();
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const defaultDateFrom = formatDate(sevenDaysAgo);
    const defaultDateTo = formatDate(today);

    const dateFrom = formatDateString(formData.get("dateFrom") as string) || defaultDateFrom;
    const dateTo = formatDateString(formData.get("dateTo") as string) || defaultDateTo;

    logger.info(`Zpracování pro období od ${dateFrom} do ${dateTo}`, {
      dateFrom,
      dateTo
    });
    logger.info(`Zvolené objekty: ${objektNames.join(", ")}`, { 
      objektNames, 
      objektCount: objektNames.length 
    });
    logger.info(`Nahraný soubor: ${fileName}`);

    // Kontrola existence uživatelova souboru
    const userFilePath = path.join(process.cwd(), 'public', 'downloads', fileName);
    if (!await fileExists(userFilePath)) {
      logger.error(`Uživatelův soubor neexistuje: ${userFilePath}`);
      return {
        success: false,
        error: `Nahraný soubor nebyl nalezen: ${fileName}`,
      };
    }

    // Kontrola, zda jde o testovací režim
    const isTestMode = formData.get("testMode") === "true";
    if (isTestMode) {
      logger.info("Aktivován testovací režim - bude použit testovací soubor místo stahování dat z Avarisu");
      // Logika pro testovací režim - použijeme předem připravená data místo stahování z Avarisu
      return await processWithTestData(fileName, processingOptions);
    }

    // Krok 2: Získání dat z Avarisu
    logger.info(
      `Spouštím captureAvarisData pro objekty: ${objektNames.join(", ")}`, {
        objektCount: objektNames.length,
        dateRange: { from: dateFrom, to: dateTo }
      }
    );

    const downloadedFiles = await captureAvarisData(
      ico,
      username,
      password,
      objektNames,
      dateFrom,
      dateTo
    );

    // Krok 3: Zpracování stažených CSV souborů
    if (Object.keys(downloadedFiles).length === 0) {
      logger.warn("Žádné soubory nebyly staženy");
      return {
        success: false,
        error: "Žádné soubory nebyly staženy z Avarisu",
      };
    }

    logger.info(`Úspěšně staženo ${Object.keys(downloadedFiles).length} souborů: ${Object.keys(downloadedFiles).join(", ")}`);
    
    // Zpracování dat pro každý objekt
    let allAvarisRecords: any[] = [];
    
    for (const [objektName, filePath] of Object.entries(downloadedFiles)) {
      try {
        logger.info(`Zpracovávám data pro objekt ${objektName} z ${filePath}`);
        const result = await processAvarisData(filePath);
        
        if (result.success && result.data) {
          logger.info(`Objekt ${objektName} zpracován úspěšně, počet záznamů: ${result.data.length}`);
          
          // Příprava dat pro vložení do Excel
          const recordsForExcel = result.data.map(record => [
            record.den || '',                // Den - sloupec A
            record.cas || '',                // Datum a čas - sloupec B
            record.strazny || record.misto   // Jméno/Místo - sloupec C
          ]);
          
          allAvarisRecords = [...allAvarisRecords, ...recordsForExcel];
        } else {
          logger.warn(`Objekt ${objektName} zpracován s chybou: ${result.error}`, {
            objektName,
            error: result.error
          });
        }
      } catch (error) {
        logger.error(
          `Chyba při zpracování dat pro objekt ${objektName}: ${error}`, {
            objektName,
            error: error instanceof Error ? error.message : 'Neznámá chyba',
            stack: error instanceof Error ? error.stack : undefined
          }
        );
      }
    }
    
    if (allAvarisRecords.length === 0) {
      logger.warn("Nepodařilo se získat žádná data z Avarisu");
      return {
        success: false,
        error: "Nepodařilo se získat žádná data z Avarisu",
      };
    }
    
    logger.info(`Celkem získáno ${allAvarisRecords.length} záznamů ze všech objektů`);

    // Krok 4: Zpracování Excel souboru - vytvoření listu s daty
    const sheetResult = await processExcelSheet(fileName, allAvarisRecords);
    
    if (!sheetResult.success) {
      logger.error(`Chyba při zpracování Excel souboru: ${sheetResult.error}`);
      return {
        success: false,
        error: sheetResult.error || "Chyba při zpracování Excel souboru",
      };
    }
    
    // Krok 5: Pokročilé zpracování (dle vybraných možností)
    const reportData: AvarisExcelResult['reportData'] = {
      dataAdded: sheetResult.dataAdded,
      message: sheetResult.message
    };
    
    // Pokud jsou požadovány pokročilé funkce zpracování
    if (processingOptions.compareNames || processingOptions.updateTimes || processingOptions.detectConsecutiveShifts) {
      logger.info(`Spouštím pokročilé zpracování pro soubor ${fileName} s možnostmi: ${JSON.stringify(processingOptions)}`);
      
      // Spuštění pokročilého zpracování s definovanými (ne undefined) hodnotami
      const advancedResult = await runAdvancedProcessing(
        fileName,
        {
          compareNames: !!processingOptions.compareNames,
          updateTimes: !!processingOptions.updateTimes,
          detectConsecutiveShifts: !!processingOptions.detectConsecutiveShifts
        }
      );
      
      if (!advancedResult.success) {
        logger.warn(`Pokročilé zpracování nebylo úspěšné: ${advancedResult.error}`, {
          error: advancedResult.error
        });
        // Pokračujeme v běhu, protože základní zpracování již bylo úspěšně dokončeno
      } else {
        logger.info(`Pokročilé zpracování dokončeno úspěšně`);
        
        // Doplnění reportů z pokročilého zpracování
        if (advancedResult.reportData) {
          reportData.nameComparisonReport = advancedResult.reportData.nameComparisonReport;
          reportData.timeUpdateReport = advancedResult.reportData.timeUpdateReport;
          reportData.consecutiveShiftsReport = advancedResult.reportData.consecutiveShiftsReport;
          reportData.consecutiveShiftsCount = advancedResult.reportData.consecutiveShiftsCount;
        }
        
        // Použít nový výstupní soubor, pokud byl vytvořen
        if (advancedResult.outputFile) {
          logger.info(`Používám nový výstupní soubor: ${advancedResult.outputFile}`);
          return {
            success: true,
            reportData,
            finalFilePath: `/processed/${advancedResult.outputFile}`
          };
        }
      }
    }
    
    // Krok 6: Vytvoření kopie zpracovaného souboru (pokud nebylo použito pokročilé zpracování)
    try {
      const processedDir = path.join(process.cwd(), "public", "processed");
      await mkdir(processedDir, { recursive: true });

      // Vytvoříme název pro zpracovaný soubor
      const extIndex = fileName.lastIndexOf(".");
      const baseName = extIndex !== -1 ? fileName.slice(0, extIndex) : fileName;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const newFileName = `${baseName}_aktualizovano_${timestamp}.xlsx`;
      const outputPath = path.join(processedDir, newFileName);
      
      // Zkopírování souboru do složky processed
      const sourceBuffer = await readFile(userFilePath);
      await writeFile(outputPath, sourceBuffer);

      const finalFilePath = `/processed/${newFileName}`;
      logger.info(`Finální soubor byl uložen do: ${finalFilePath}`);

      return {
        success: true,
        reportData,
        finalFilePath,
      };
    } catch (error) {
      logger.error(`Chyba při vytváření výstupního souboru: ${error}`, {
        error: error instanceof Error ? error.message : 'Neznámá chyba',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        error: `Chyba při vytváření výstupního souboru: ${error instanceof Error ? error.message : "Neznámá chyba"}`,
      };
    }
  } catch (error) {
    logger.error("Chyba v server action:", {
      error: error instanceof Error ? error.message : 'Neznámá chyba',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neznámá chyba",
    };
  }
}

/**
 * Funkce pro zpracování v testovacím režimu
 * @param fileName Název souboru nahraného uživatelem
 * @param options Možnosti zpracování
 */
async function processWithTestData(
  fileName: string,
  options: ProcessingOptions
): Promise<AvarisExcelResult> {
  logger.info(`Spouštím testovací režim pro soubor ${fileName}`);
  
  try {
    // Cesta k testovacímu souboru
    const testFilePath = path.join(process.cwd(), 'public', 'testsource', 'Testovací tabulka.xlsx');
    
    // Kontrola existence testovacího souboru
    if (!await fileExists(testFilePath)) {
      logger.error(`Testovací soubor neexistuje: ${testFilePath}`);
      return {
        success: false,
        error: `Testovací soubor nenalezen. Ujistěte se, že soubor 'Testovací tabulka.xlsx' existuje ve složce public/testsource`
      };
    }
    
    // Načtení testovacího souboru
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(testFilePath);
    
    // Kontrola struktury testovacího souboru
    if (!workbook.getWorksheet('List1') || !workbook.getWorksheet('List2')) {
      logger.error(`Testovací soubor nemá požadovanou strukturu (List1 a List2)`);
      return {
        success: false,
        error: `Testovací soubor nemá požadovanou strukturu. Musí obsahovat listy List1 a List2.`
      };
    }
    
    // Kopírování testovacích dat do souboru uživatele
    const userFilePath = path.join(process.cwd(), 'public', 'downloads', fileName);
    
    // Zkopírujeme testovací data do List2 souboru uživatele
    const userWorkbook = new ExcelJS.Workbook();
    await userWorkbook.xlsx.readFile(userFilePath);
    
    // Nahradíme List2 nebo ho vytvoříme, pokud neexistuje
    const sourceList2 = workbook.getWorksheet('List2');
    
    // Kontrola, zda sourceList2 existuje
    if (!sourceList2) {
      logger.error(`Testovací soubor neobsahuje List2`);
      return {
        success: false,
        error: `Testovací soubor musí obsahovat list List2.`
      };
    }
    
    let targetList2 = userWorkbook.getWorksheet('List2');
    
    if (targetList2) {
      userWorkbook.removeWorksheet(targetList2.id);
    }
    
    // Vytvoříme nový List2 zkopírováním z testovacího souboru
    targetList2 = userWorkbook.addWorksheet('List2');
    
    // Kopírování dat a formátování
    sourceList2.eachRow((row, rowIndex) => {
      const newRow = targetList2!.getRow(rowIndex);
      
      // Kopírování hodnot
      row.eachCell((cell, colIndex) => {
        newRow.getCell(colIndex).value = cell.value;
      });
      
      // Kopírování formátování
      newRow.height = row.height;
      newRow.commit();
    });
    
    // Kopírování nastavení sloupců
    sourceList2.columns.forEach((column, index) => {
      if (targetList2 && targetList2.columns[index]) {
        targetList2.columns[index].width = column.width;
      }
    });
    
    // Uložení změn
    await userWorkbook.xlsx.writeFile(userFilePath);
    
    logger.info(`Testovací data byla úspěšně kopírována do souboru ${fileName}`);
    
    // Nyní spustíme pokročilé zpracování s definovanými (ne undefined) hodnotami
    const result = await runAdvancedProcessing(
      fileName,
      {
        compareNames: !!options.compareNames,
        updateTimes: !!options.updateTimes,
        detectConsecutiveShifts: !!options.detectConsecutiveShifts
      }
    );
    
    if (!result.success) {
      logger.error(`Chyba při pokročilém zpracování v testovacím režimu: ${result.error}`);
      return {
        success: false,
        error: result.error || "Chyba při pokročilém zpracování v testovacím režimu"
      };
    }
    
    // Připravit výsledek
    logger.info(`Testovací režim dokončen úspěšně, výsledky: ${JSON.stringify(result.reportData || {})}`);
    return {
      success: true,
      reportData: {
        message: "Testovací režim: Data byla úspěšně zpracována",
        nameComparisonReport: result.reportData?.nameComparisonReport,
        timeUpdateReport: result.reportData?.timeUpdateReport,
        consecutiveShiftsReport: result.reportData?.consecutiveShiftsReport,
        consecutiveShiftsCount: result.reportData?.consecutiveShiftsCount
      },
      finalFilePath: result.outputFile ? `/processed/${result.outputFile}` : undefined
    };
  } catch (error) {
    logger.error(`Chyba v testovacím režimu: ${error}`, {
      error: error instanceof Error ? error.message : 'Neznámá chyba',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: `Chyba v testovacím režimu: ${error instanceof Error ? error.message : "Neznámá chyba"}`
    };
  }
}