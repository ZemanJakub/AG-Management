// app/actions/podklady/processAvarisWithExcel.ts
"use server";

import { createLogger } from "@/modules/podklady/services/logger";
import { captureAvarisData } from "@/modules/podklady/services/scraper";
import { processAvarisData } from "@/modules/podklady/services/csvProcessor";
import { writeFile, mkdir, readFile, access } from "fs/promises";
import path from "path";
import { processExcelSheet } from "./enhancedSheetProcessor";

const logger = createLogger("avaris-excel-action");

export type AvarisExcelResult = {
  success: boolean;
  error?: string;
  reportData?: {
    dataAdded?: number;
    message?: string;
  };
  finalFilePath?: string;
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
 */
export async function processAvarisWithExcel(
  formData: FormData
): Promise<AvarisExcelResult> {
  try {
    logger.info(
      "Zpracovávám požadavek na integraci Avaris dat do Excel souboru"
    );

    // Krok 1: Načtení parametrů z formuláře
    const ico = "25790668" as string; // Hardcoded přihlašovací údaje
    const username = "reditel@ares-group.cz" as string;
    const password = "slunicko" as string;

    // Získání nahrané souboru
    const fileName = formData.get("fileName") as string;

    if (!fileName) {
      return {
        success: false,
        error: "Nebyl nahrán žádný soubor",
      };
    }

    // Získání objektů
    const objektInput = (formData.get("objekty") as string);
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

    logger.info(`Zpracování pro období od ${dateFrom} do ${dateTo}`);
    logger.info(`Zvolené objekty: ${objektNames.join(", ")}`);
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

    // Krok 2: Získání dat z Avarisu
    logger.info(
      `Spouštím captureAvarisData pro objekty: ${objektNames.join(", ")}`
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
          logger.warn(`Objekt ${objektName} zpracován s chybou: ${result.error}`);
        }
      } catch (error) {
        logger.error(
          `Chyba při zpracování dat pro objekt ${objektName}: ${error}`
        );
      }
    }
    
    if (allAvarisRecords.length === 0) {
      return {
        success: false,
        error: "Nepodařilo se získat žádná data z Avarisu",
      };
    }
    
    logger.info(`Celkem získáno ${allAvarisRecords.length} záznamů ze všech objektů`);

    // Krok 4: Zpracování Excel souboru - využití nové logiky
    const sheetResult = await processExcelSheet(fileName, allAvarisRecords);
    
    if (!sheetResult.success) {
      return {
        success: false,
        error: sheetResult.error || "Chyba při zpracování Excel souboru",
      };
    }
    
    // Krok 5: Vytvoření kopie zpracovaného souboru
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
        reportData: {
          dataAdded: sheetResult.dataAdded,
          message: sheetResult.message
        },
        finalFilePath,
      };
    } catch (error) {
      logger.error(`Chyba při vytváření výstupního souboru: ${error}`);
      return {
        success: false,
        error: `Chyba při vytváření výstupního souboru: ${error instanceof Error ? error.message : "Neznámá chyba"}`,
      };
    }
  } catch (error) {
    logger.error("Chyba v server action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neznámá chyba",
    };
  }
}