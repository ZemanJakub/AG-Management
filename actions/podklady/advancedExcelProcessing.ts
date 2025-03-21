// app/actions/avaris/advancedExcelProcessing.ts
"use server";

import ExcelJS from "exceljs";
import path from "path";
import { StructuredLogger } from "@/modules/podklady/services/structuredLogger";
import fs from "fs/promises";
import { NameComparisonService } from "@/modules/podklady/services/nameComparisonService";
import {
  ShiftData,
  ClockRecord,
  extractShiftsFromList1,
  extractClockRecordsFromList2,
  updateExcelWorkbook,
} from "@/modules/podklady/services/excelDataExtractor";
import {
  detectConsecutiveShifts,
  generateConsecutiveShiftsReport,
} from "@/modules/podklady/services/consecutiveShiftDetector";
import {
  updateShiftTimes,
  generateTimeUpdateReport,
} from "@/modules/podklady/services/shiftTimeProcessor";

// Inicializace StructuredLogger místo starého createLogger
const logger = StructuredLogger.getInstance().getComponentLogger("advanced-excel-processing");

export type AdvancedProcessingResult = {
  success: boolean;
  error?: string;
  message?: string;
  sourceFile?: string;
  outputFile?: string;
  reportData?: {
    nameComparisonReport?: string;
    timeUpdateReport?: string;
    consecutiveShiftsReport?: string;
    consecutiveShiftsCount?: number;
    dataStatistics?: any;
  };
};

/**
 * Funkce pro načtení zdrojového souboru - buď z výstupu předchozí činnosti nebo testovacího souboru
 */
export async function loadSourceData(
  sourceFileName: string | null,
  useTestData: boolean = false
): Promise<AdvancedProcessingResult> {
  // Generujeme korelační ID pro sledování této operace
  const correlationId = `load_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  logger.setCorrelationId(correlationId);
  
  try {
    logger.info(
      `Načítám zdrojový soubor pro pokročilé zpracování, testovací režim: ${useTestData}`, {
        sourceFileName,
        useTestData
      }
    );

    let filePath: string;

    if (useTestData) {
      // Testovací data
      filePath = path.join(
        process.cwd(),
        "public",
        "testsource",
        "Testovací tabulka.xlsx"
      );
      logger.info(`Používám testovací soubor: ${filePath}`);
    } else if (sourceFileName) {
      // Soubor z předchozí činnosti
      filePath = path.join(
        process.cwd(),
        "public",
        "downloads",
        sourceFileName
      );
      logger.info(`Používám soubor z předchozí činnosti: ${filePath}`);
    } else {
      logger.error("Nebyl zadán název souboru a zároveň není zapnutý testovací režim");
      return {
        success: false,
        error:
          "Nebyl zadán název souboru a zároveň není zapnutý testovací režim",
      };
    }

    // Kontrola existence souboru
    try {
      await fs.access(filePath);
      logger.info(`Zdrojový soubor existuje: ${filePath}`);
    } catch (error) {
      logger.error(`Zdrojový soubor neexistuje: ${filePath}`, {
        error: error instanceof Error ? error.message : 'Neznámá chyba'
      });

      if (useTestData) {
        return {
          success: false,
          error: `Testovací soubor nenalezen. Ujistěte se, že soubor 'Testovací tabulka.xlsx' existuje ve složce public/testsource`,
        };
      } else {
        return {
          success: false,
          error: `Zdrojový soubor neexistuje: ${sourceFileName}`,
        };
      }
    }

    // Načtení souboru pro základní informace
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      // Kontrola struktury souboru
      const list1Exists = workbook.getWorksheet("List1") !== undefined;
      const list2Exists = workbook.getWorksheet("List2") !== undefined;

      if (!list1Exists) {
        logger.error("Soubor neobsahuje list 'List1', který je nezbytný pro pokročilé zpracování");
        return {
          success: false,
          error:
            "Soubor neobsahuje list 'List1', který je nezbytný pro pokročilé zpracování",
        };
      }

      // Základní informace o souboru
      const stats = {
        fileName: path.basename(filePath),
        fullPath: filePath,
        hasList1: list1Exists,
        hasList2: list2Exists,
        worksheetCount: workbook.worksheets.length,
        worksheetNames: workbook.worksheets.map((ws) => ws.name),
      };

      logger.info(
        `Soubor byl úspěšně načten, statistika:`, stats
      );

      return {
        success: true,
        message: `Soubor ${stats.fileName} byl úspěšně načten. Obsahuje ${stats.worksheetCount} listů.`,
        sourceFile: path.basename(filePath),
      };
    } catch (error) {
      logger.error(`Chyba při načítání souboru: ${error}`, {
        error: error instanceof Error ? error.message : 'Neznámá chyba',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        error: `Chyba při načítání souboru: ${error instanceof Error ? error.message : "Neznámá chyba"}`,
      };
    }
  } catch (error) {
    logger.error(`Neočekávaná chyba při načítání zdrojových dat: ${error}`, {
      error: error instanceof Error ? error.message : 'Neznámá chyba',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: `Neočekávaná chyba: ${error instanceof Error ? error.message : "Neznámá chyba"}`,
    };
  }
}

/**
 * Funkce pro pokročilé zpracování Excel souboru
 * @param sourceFileName Název zdrojového souboru
 * @param options Možnosti zpracování
 * @returns Výsledek zpracování
 */
export async function runAdvancedProcessing(
  sourceFileName: string,
  options: {
    compareNames: boolean;
    updateTimes: boolean;
    detectConsecutiveShifts: boolean;
  }
): Promise<AdvancedProcessingResult> {
  // Generujeme korelační ID pro sledování této operace
  const correlationId = `process_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  logger.setCorrelationId(correlationId);
  
  logger.info(
    `Spouštím pokročilé zpracování souboru ${sourceFileName} s možnostmi:`, {
      sourceFile: sourceFileName,
      options
    }
  );

  try {
    // Sestavení cesty k souboru
    let sourceFilePath: string;

    // Kontrola, zda je to testovací soubor nebo běžný soubor
    if (sourceFileName === "Testovací tabulka.xlsx") {
      sourceFilePath = path.join(
        process.cwd(),
        "public",
        "testsource",
        sourceFileName
      );
    } else {
      sourceFilePath = path.join(
        process.cwd(),
        "public",
        "downloads",
        sourceFileName
      );
    }

    // Kontrola existence souboru
    try {
      await fs.access(sourceFilePath);
      logger.info(`Zdrojový soubor pro zpracování existuje: ${sourceFilePath}`);
    } catch (error) {
      logger.error(
        `Zdrojový soubor pro zpracování neexistuje: ${sourceFilePath}`, {
          error: error instanceof Error ? error.message : 'Neznámá chyba'
        }
      );
      return {
        success: false,
        error: `Zdrojový soubor pro zpracování neexistuje: ${sourceFileName}`,
      };
    }

    // Načtení souboru do paměti
    const fileBuffer = await fs.readFile(sourceFilePath);

    // Výsledky pro reporty
    const reportData: AdvancedProcessingResult["reportData"] = {};

    // Vytváření instancí služeb
    let nameComparisonService: NameComparisonService | undefined;
    let processedWorkbook: ExcelJS.Workbook | undefined;

    // 1. Porovnání a korekce jmen
    if (options.compareNames) {
      logger.info(
        `Spouštím porovnání a korekci jmen pro soubor: ${sourceFileName}`
      );

      try {
        // Vytvoření instance služby pro porovnávání jmen s explicitními nastaveními
        nameComparisonService = new NameComparisonService(
          new ExcelJS.Workbook(),
          {
            list1NameColumn: "B", // Jména v List1 jsou ve sloupci B
            list2NameColumn: "C", // Jména v List2 jsou ve sloupci C
            list1StartRow: 5, // Data v List1 začínají od řádku 5
            list2StartRow: 6, // Data v List2 začínají od řádku 6
            similarityThreshold: 2, // Max. 2 odlišné znaky pro "bezpečnou shodu"
            applyChanges: true, // Aplikovat změny do workbooku
            maxRows: 50, // Omezení na max. 50 řádků pro prevenci problémů
          }
        );

        // Načtení dat z bufferu (asynchronní operace)
        await nameComparisonService.loadFromBuffer(fileBuffer);

        // Log pro ověření, co se děje
        logger.info(
          `Služba pro porovnávání jmen byla inicializována, spouštím porovnání`
        );

        // Provedení porovnání
        const nameResults = await nameComparisonService.compareAndFixNames();

        // Log o výsledcích
        logger.info(`Porovnání dokončeno. Výsledky:`, {
          total: nameResults.stats.total,
          exactMatches: nameResults.stats.exactMatches,
          safeMatches: nameResults.stats.safeMatches,
          noMatches: nameResults.stats.noMatches
        });

        // Uložení výsledků pro report
        reportData.nameComparisonReport =
          nameComparisonService.generateReport(nameResults);

        // Pokud máme změny, uložíme workbook pro další zpracování
        if (nameResults.workbook) {
          processedWorkbook = nameResults.workbook;
          logger.info(`Workbook byl aktualizován a bude uložen`);
        } else {
          logger.info(
            `Žádné změny nebyly provedeny, workbook nebude aktualizován`
          );
        }
      } catch (error) {
        logger.error(`Chyba při porovnávání jmen: ${error}`, {
          error: error instanceof Error ? error.message : 'Neznámá chyba',
          stack: error instanceof Error ? error.stack : undefined
        });
        return {
          success: false,
          error: `Chyba při porovnávání jmen: ${error instanceof Error ? error.message : "Neznámá chyba"}`,
        };
      }
    }

    // Pokud nemáme workbook z předchozího kroku, načteme ho znovu
    if (!processedWorkbook) {
      processedWorkbook = new ExcelJS.Workbook();
      await processedWorkbook.xlsx.readFile(sourceFilePath);
      logger.info(`Workbook byl nově načten pro další zpracování`);
    }

    // 2. a 3. Detekce navazujících směn a aktualizace časů
    if (
      (options.detectConsecutiveShifts || options.updateTimes) &&
      processedWorkbook
    ) {
      try {
        // Získání listů
        const list1 = processedWorkbook.getWorksheet("List1");
        const list2 = processedWorkbook.getWorksheet("List2");

        if (!list1 || !list2) {
          throw new Error(
            "Některý z požadovaných listů (List1 nebo List2) neexistuje"
          );
        }

        // Extrakce dat
        const shifts = extractShiftsFromList1(list1);
        const clockRecords = extractClockRecordsFromList2(list2);

        logger.info(
          `Extrahováno ${shifts.length} směn a ${clockRecords.length} čipovacích záznamů`, {
            shiftsCount: shifts.length,
            recordsCount: clockRecords.length
          }
        );

        // Detekce navazujících směn
        let consecutiveShifts: { first: ShiftData; second: ShiftData }[] = [];

        if (options.detectConsecutiveShifts) {
          logger.info(`Spouštím detekci navazujících směn`);

          const consecutiveResults = detectConsecutiveShifts(shifts);
          consecutiveShifts = consecutiveResults.consecutiveShifts;

          logger.info(
            `Detekováno ${consecutiveShifts.length} párů navazujících směn (${consecutiveResults.shiftsWithConsecutive} směn)`, {
              pairsCount: consecutiveShifts.length,
              shiftsCount: consecutiveResults.shiftsWithConsecutive
            }
          );

          // Uložení počtu do reportu
          reportData.consecutiveShiftsCount = consecutiveShifts.length;

          // Generování reportu o navazujících směnách
          reportData.consecutiveShiftsReport =
            generateConsecutiveShiftsReport(consecutiveShifts);
        }

        // Aktualizace časů
        if (options.updateTimes) {
          logger.info(`Spouštím aktualizaci časů příchodů a odchodů`);

          const timeUpdateResults = updateShiftTimes(
            shifts,
            clockRecords,
            consecutiveShifts,
            { timeWindowHours: 4 }
          );

          logger.info(
            `Aktualizováno ${timeUpdateResults.updatedShifts} směn, nalezeno ${timeUpdateResults.entriesFound} příchodů a ${timeUpdateResults.exitsFound} odchodů`, {
              updatedShifts: timeUpdateResults.updatedShifts,
              entriesFound: timeUpdateResults.entriesFound,
              exitsFound: timeUpdateResults.exitsFound
            }
          );
          // Informace o použitých řádcích
          logger.info(
            `Mapa usedRowsStart obsahuje ${timeUpdateResults.usedRowsStart.size} položek`
          );
          logger.info(
            `Mapa usedRowsEnd obsahuje ${timeUpdateResults.usedRowsEnd.size} položek`
          );

          // Podrobné logování pro prvních 10 položek z mapy usedRowsStart
          let count = 0;
          timeUpdateResults.usedRowsStart.forEach((list2Row, list1Row) => {
            if (count < 10) {
              logger.debug(`Příchod: List1 řádek ${list1Row} -> List2 řádek ${list2Row}`);
              count++;
            }
          });
          
          // Generování reportu o aktualizaci časů
          reportData.timeUpdateReport =
            generateTimeUpdateReport(timeUpdateResults);

          // Aktualizace workbooku podle upravených dat
          updateExcelWorkbook(processedWorkbook, shifts, consecutiveShifts, timeUpdateResults);
        }
      } catch (error) {
        logger.error(
          `Chyba při zpracování časů nebo navazujících směn: ${error}`, {
            error: error instanceof Error ? error.message : 'Neznámá chyba',
            stack: error instanceof Error ? error.stack : undefined
          }
        );
        return {
          success: false,
          error: `Chyba při zpracování časů nebo navazujících směn: ${error instanceof Error ? error.message : "Neznámá chyba"}`,
        };
      }
    }

    // Uložení výsledného souboru
    if (processedWorkbook) {
      // Vytvoření názvu pro výsledný soubor
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const extIndex = sourceFileName.lastIndexOf(".");
      const baseName =
        extIndex !== -1 ? sourceFileName.slice(0, extIndex) : sourceFileName;
      const outputFileName = `${baseName}_zpracovano_${timestamp}.xlsx`;
      const outputPath = path.join(
        process.cwd(),
        "public",
        "processed",
        outputFileName
      );

      // Ujistíme se, že adresář existuje
      await fs.mkdir(path.join(process.cwd(), "public", "processed"), {
        recursive: true,
      });

      // Uložení souboru
      await processedWorkbook.xlsx.writeFile(outputPath);

      logger.info(`Výsledný soubor byl uložen do: ${outputPath}`);

      return {
        success: true,
        message: "Pokročilé zpracování bylo úspěšně dokončeno",
        sourceFile: sourceFileName,
        outputFile: outputFileName,
        reportData,
      };
    } else {
      // Pokud nedošlo k žádným změnám, vrátíme pouze reporty
      logger.info("Pokročilé zpracování bylo dokončeno, ale nebyly provedeny žádné změny");
      return {
        success: true,
        message:
          "Pokročilé zpracování bylo dokončeno, nebyly provedeny žádné změny",
        sourceFile: sourceFileName,
        reportData,
      };
    }
  } catch (error) {
    logger.error(`Chyba při pokročilém zpracování: ${error}`, {
      error: error instanceof Error ? error.message : 'Neznámá chyba',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: `Chyba při pokročilém zpracování: ${error instanceof Error ? error.message : "Neznámá chyba"}`,
    };
  }
}