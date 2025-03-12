// app/actions/avaris/processAvarisWithExcel.ts
"use server";

import { createLogger } from "@/modules/podklady/services/logger";
import { captureAvarisData } from "@/modules/podklady/services/scraper";
import { processAvarisData } from "@/modules/podklady/services/csvProcessor";
import { writeFile, mkdir, readFile, access, copyFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { ExcelProcessor } from "@/modules/podklady/services/excelProcessor";
import { copySheet, getFileInfo } from "@/actions/podklady/copySheet";

const logger = createLogger("avaris-excel-action");

export type AvarisExcelResult = {
  success: boolean;
  error?: string;
  reportData?: {
    nameReport?: string;
    timeReport?: string;
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
    logger.info("Zpracovávám stažené CSV soubory");
    const processedData: any = {};

    // Zpracování dat pro každý objekt
    for (const [objektName, filePath] of Object.entries(downloadedFiles)) {
      try {
        logger.info(`Zpracovávám data pro objekt ${objektName} z ${filePath}`);
        const result = await processAvarisData(filePath);
        processedData[objektName] = result;
        if (result.success) {
          logger.info(`Objekt ${objektName} zpracován úspěšně, XLSX cesta: ${result.xlsxFilePath}`);
        } else {
          logger.warn(`Objekt ${objektName} zpracován s chybou: ${result.error}`);
        }
      } catch (error) {
        logger.error(
          `Chyba při zpracování dat pro objekt ${objektName}: ${error}`
        );
      }
    }

    // Krok 4: Najdeme první úspěšně zpracovaný objekt
    let sourceXlsxPath = "";
    let realSourceFilePath = "";
    
    for (const [objektName, data] of Object.entries(processedData)) {
      const objData = data as any;
      if (objData && objData.success && objData.xlsxFilePath) {
        sourceXlsxPath = objData.xlsxFilePath;
        // Převedeme relativní cestu na absolutní
        realSourceFilePath = path.join(process.cwd(), 'public', objData.xlsxFilePath.substring(1));
        logger.info(`Nalezen zdrojový soubor: ${sourceXlsxPath}, absolutní cesta: ${realSourceFilePath}`);
        break;
      }
    }

    if (!sourceXlsxPath) {
      return {
        success: false,
        error: "Nepodařilo se zpracovat žádný objekt",
      };
    }

    // Ověříme, že soubor skutečně existuje
    const exists = await fileExists(realSourceFilePath);
    logger.info(`Kontrola existence souboru ${realSourceFilePath}: ${exists ? 'soubor existuje' : 'soubor neexistuje'}`);

    if (!exists) {
      return {
        success: false,
        error: `Zdrojový soubor neexistuje: ${realSourceFilePath}`,
      };
    }

    // Krok 5: Připravíme soubory pro kopírování dat
    try {
      // Získáme informace o souborech - upraveno pro použití přímé cesty k souboru
      const sourceFileName = path.basename(realSourceFilePath);
      const targetFilePath = path.join(process.cwd(), 'public', 'downloads', fileName);
      
      logger.info(`Připravuji kopírování dat ze souboru ${sourceFileName} do ${fileName}`);
      
      // Nejprve vytvoříme kopii zdrojového souboru, abychom předešli jeho smazání
      const sourceFileBackup = path.join(
        process.cwd(), 
        'public', 
        'downloads', 
        `backup_${sourceFileName}`
      );
      
      // Kopírování souboru pomocí fs.promises
      await copyFile(realSourceFilePath, sourceFileBackup);
      logger.info(`Vytvořena záloha zdrojového souboru: ${sourceFileBackup}`);

      // Ověříme, že záloha byla skutečně vytvořena
      if (!await fileExists(sourceFileBackup)) {
        logger.error(`Záložní soubor nebyl vytvořen: ${sourceFileBackup}`);
        return {
          success: false,
          error: "Nepodařilo se vytvořit zálohu zdrojového souboru",
        };
      }
      
      // Získáme pouze název záložního souboru pro copySheet
      const backupFileName = path.basename(sourceFileBackup);
      logger.info(`Název záložního souboru pro copySheet: ${backupFileName}`);

      // Krok 6: Použijeme copySheet pro vytvoření List2 s lepším formátováním
      logger.info(`Volám copySheet s parametry: zdrojový soubor=${backupFileName}, cílový soubor=${fileName}`);
      const copyResult = await copySheet(
        backupFileName, // Pouze název záložního souboru
        fileName
      );

      if (!copyResult.success) {
        logger.error(`Chyba při vytváření nového listu: ${copyResult.error}`);
        return {
          success: false,
          error: `Chyba při vytváření nového listu: ${copyResult.error}`,
        };
      }

      logger.info(`Úspěšně vytvořen nový list: ${copyResult.newSheetName}`);

      // Krok 7: Nyní načteme výsledný soubor a použijeme ExcelProcessor pro další zpracování
      logger.info(`Načítám výsledný soubor pro zpracování: ${targetFilePath}`);
      const fileBuffer = await readFile(targetFilePath);

      // Převod Buffer na ArrayBuffer
      const arrayBuffer = new Uint8Array(fileBuffer).buffer;

      // Nyní použijeme správný typ ArrayBuffer
      logger.info(`Inicializuji ExcelProcessor pro další zpracování`);
      const processor = new ExcelProcessor(arrayBuffer);
      const processedBuffer = processor.processAll();
      const reportData = processor.getReport();

      // Krok 8: Uložíme zpracovaný soubor
      const processedDir = path.join(process.cwd(), "public", "processed");
      await mkdir(processedDir, { recursive: true });

      // Vytvoříme název pro zpracovaný soubor
      const extIndex = fileName.lastIndexOf(".");
      const baseName = extIndex !== -1 ? fileName.slice(0, extIndex) : fileName;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const newFileName = `${baseName}_komplet_${timestamp}.xlsx`;
      const outputPath = path.join(processedDir, newFileName);

      // Uložíme výsledný soubor
      await writeFile(outputPath, Buffer.from(processedBuffer));

      const finalFilePath = `/processed/${newFileName}`;
      logger.info(`Finální soubor byl uložen do: ${finalFilePath}`);

      // Zkusíme odstranit záložní soubor, ale neskončíme chybou, pokud se to nepodaří
      try {
        await fs.promises.unlink(sourceFileBackup);
        logger.info(`Záložní soubor byl odstraněn: ${sourceFileBackup}`);
      } catch (error) {
        logger.warn(`Nepodařilo se odstranit záložní soubor ${sourceFileBackup}: ${error}`);
      }

      return {
        success: true,
        reportData,
        finalFilePath,
      };
    } catch (error) {
      logger.error(`Chyba při zpracování Excel souboru: ${error}`);
      return {
        success: false,
        error: `Chyba při zpracování Excel souboru: ${error instanceof Error ? error.message : "Neznámá chyba"}`,
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