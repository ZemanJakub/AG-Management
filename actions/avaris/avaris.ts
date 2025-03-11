// app/actions/avaris/avaris.ts
"use server";

import { revalidatePath } from "next/cache";
import { createLogger } from "@/modules/avaris/services/logger";
import { captureAvarisData } from "@/modules/avaris/services/scraper";
import { processAvarisData } from "@/modules/avaris/services/csvProcessor";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";
import { ExcelProcessor } from "@/modules/avaris/services/excelProcessor";

const logger = createLogger("avaris-action");

export type AvarisResult = {
  success: boolean;
  error?: string;
  files?: { [key: string]: string };
  processedData?: any;
  timestamp?: string;
  processedCount?: number;
  totalCount?: number;
  uploadedFile?: {
    fileName: string;
    filePath: string;
  };
  reportData?: {
    nameReport?: string;
    timeReport?: string;
  };
  finalFilePath?: string;
};

/**
 * Hlavní serverová akce pro získání a zpracování dat z Avarisu
 * @param formData Formulářová data od uživatele
 */
export async function processAvarisRequest(formData: FormData): Promise<AvarisResult> {
  try {
    logger.info("Zpracovávám komplexní požadavek na získání a zpracování Avaris dat");
    
    // Krok 1: Načtení parametrů z formuláře
    const ico = "25790668" as string; // Hardcoded přihlašovací údaje
    const username = "reditel@ares-group.cz" as string;
    const password = "slunicko" as string;

    // Získání objektů - podporujeme více objektů
    const objektInput = (formData.get("objekty") as string) || "RENOCAR";
    const objektNames = objektInput
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (objektNames.length === 0) {
      logger.warn('Nebyly zadány žádné objekty, používám výchozí "RENOCAR"');
      objektNames.push("RENOCAR");
    }

    // Získání datumů z formuláře s výchozími hodnotami
    const today = new Date();
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    // Výchozí datum od: o 7 dní zpět
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const defaultDateFrom = formatDate(sevenDaysAgo);
    const defaultDateTo = formatDate(today);

    // Použití hodnot z formuláře nebo výchozích hodnot
    const dateFrom = (formData.get("dateFrom") as string) || defaultDateFrom;
    const dateTo = (formData.get("dateTo") as string) || defaultDateTo;
    
    // Kontrola, zda byl nahrán soubor Excel
    const uploadedFile = formData.get("file") as File;
    let userExcelBuffer: Buffer | null = null;
    let uploadedFileName = "";
    
    if (uploadedFile) {
      uploadedFileName = uploadedFile.name;
      const arrayBuffer = await uploadedFile.arrayBuffer();
      userExcelBuffer = Buffer.from(arrayBuffer);
      
      logger.info(`Nahrán soubor: ${uploadedFileName}`);
      
      // Uložení nahraného souboru
      const downloadDir = path.join(process.cwd(), "public", "downloads");
      await mkdir(downloadDir, { recursive: true });
      await writeFile(path.join(downloadDir, uploadedFileName), userExcelBuffer);
    }

    // Krok 2: Získání dat z Avarisu
    logger.info(`Spouštím captureAvarisData pro objekty: ${objektNames.join(", ")}`);
    
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
        error: "Žádné soubory nebyly staženy",
        timestamp: new Date().toISOString(),
      };
    }
    
    logger.info("Zpracovávám stažené CSV soubory");
    const processedData:any = {};
    
    // Zpracování dat pro každý objekt
    for (const [objektName, filePath] of Object.entries(downloadedFiles)) {
      try {
        const result = await processAvarisData(filePath);
        processedData[objektName] = result;
      } catch (error) {
        logger.error(`Chyba při zpracování dat pro objekt ${objektName}: ${error}`);
      }
    }
    
    // Krok 4: Pokud byl nahrán Excel soubor, proveďme integraci dat
    let finalFilePath = "";
    let reportData = {};
    
    if (userExcelBuffer && uploadedFileName) {
      try {
        logger.info("Zahajuji integraci dat do nahraného Excel souboru");
        
        // Najdeme první úspěšně zpracovaný objekt
        let sourceXlsxPath = "";
        for (const [objektName, data] of Object.entries(processedData)) {
          const objData = data as any;
          if (objData && objData.success && objData.xlsxFilePath) {
            sourceXlsxPath = objData.xlsxFilePath;
            break;
          }
        }
        
        if (!sourceXlsxPath) {
          throw new Error("Nepodařilo se najít žádný zpracovaný XLSX soubor");
        }
        
        // Cesta k zdrojovému XLSX souboru
        const absoluteSourcePath = path.join(process.cwd(), "public", sourceXlsxPath);
        const sourceBuffer = await readFile(absoluteSourcePath);
        
        // Načtení souborů do workbooků
        const sourceWorkbook = XLSX.read(sourceBuffer, { type: "buffer" });
        const targetWorkbook = XLSX.read(userExcelBuffer, { type: "buffer" });
        
        // Kopírování listu ze zdrojového do cílového workbooku
        const sourceSheet = sourceWorkbook.Sheets[sourceWorkbook.SheetNames[0]];
        
        // Vytvoření nového listu a přidání instrukcí
        const newSheetName = "List2";
        
        // Odstranění listu, pokud již existuje
        if (targetWorkbook.SheetNames.includes(newSheetName)) {
          const index = targetWorkbook.SheetNames.indexOf(newSheetName);
          targetWorkbook.SheetNames.splice(index, 1);
          delete targetWorkbook.Sheets[newSheetName];
        }
        
        // Přidání nového listu
        targetWorkbook.SheetNames.push(newSheetName);
        targetWorkbook.Sheets[newSheetName] = sourceSheet;
        
        // Krok 5: Provedení dalšího zpracování (porovnání jmen, aktualizace časů)
        // Převedeme workbook na buffer pro ExcelProcessor
        const workbookBuffer = XLSX.write(targetWorkbook, { type: "buffer", bookType: "xlsx" });
        const processor = new ExcelProcessor(workbookBuffer.buffer);
        const processorOutputBuffer = processor.processAll();
        reportData = processor.getReport();
        
        // Načteme zpracovaný workbook z výsledného bufferu
        const outputWorkbook = XLSX.read(processorOutputBuffer, { type: "array" });
        
        // Uložení finálního souboru
        const processedDir = path.join(process.cwd(), "public", "processed");
        await mkdir(processedDir, { recursive: true });
        
        // Vytvoření názvu pro zpracovaný soubor
        const extIndex = uploadedFileName.lastIndexOf(".");
        const baseName = extIndex !== -1 ? uploadedFileName.slice(0, extIndex) : uploadedFileName;
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const newFileName = `${baseName}_komplet_${timestamp}.xlsx`;
        const outputPath = path.join(processedDir, newFileName);
        
        // Uložení výsledného souboru
        const outputBuffer = XLSX.write(outputWorkbook, { type: "buffer", bookType: "xlsx" });
        await writeFile(outputPath, outputBuffer);
        
        finalFilePath = `/processed/${newFileName}`;
        logger.info(`Finální soubor byl uložen do: ${finalFilePath}`);
      } catch (error) {
        logger.error(`Chyba při integraci dat do Excel souboru: ${error}`);
        return {
          success: false,
          error: `Chyba při zpracování Excel souboru: ${error instanceof Error ? error.message : "Neznámá chyba"}`,
          files: downloadedFiles,
          processedData,
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Invalidovat cache pro cestu
    revalidatePath("/avaris-data");

    return {
      success: true,
      files: downloadedFiles,
      processedData,
      timestamp: new Date().toISOString(),
      processedCount: Object.keys(processedData).length,
      totalCount: objektNames.length,
      uploadedFile: uploadedFileName ? {
        fileName: uploadedFileName,
        filePath: `/downloads/${uploadedFileName}`,
      } : undefined,
      reportData,
      finalFilePath,
    };
  } catch (error) {
    logger.error("Chyba v server action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neznámá chyba",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Původní funkce pro zpětnou kompatibilitu
 */
export async function getAvarisData(formData: FormData) {
  return processAvarisRequest(formData);
}