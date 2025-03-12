// app/actions/avaris/processExcel.ts
'use server'

import { ExcelProcessor } from '@/modules/podklady/services/excelProcessor';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';


type ProcessResult = {
  success: boolean;
  error?: string;
  fileName?: string;
  filePath?: string;
  nameReport?: string;
  timeReport?: string;
}

/**
 * Server action pro zpracování Excel souboru - kompletní náhrada maker
 */
export async function processExcelFile(formData: FormData): Promise<ProcessResult> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        error: 'Žádný soubor nebyl nahrán'
      };
    }

    // Kontrola typu souboru
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      return {
        success: false,
        error: 'Pouze soubory Excel (.xlsx) jsou povoleny'
      };
    }

    // Konverze File na ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Zpracování Excel souboru
    const processor = new ExcelProcessor(fileBuffer);
    const outputBuffer = processor.processAll();
    
    // Získání reportu pro náhled
    const { nameReport, timeReport } = processor.getReport();
    
    // Vytvoření složky public/processed, pokud neexistuje
    const processedDir = path.join(process.cwd(), 'public', 'processed');
    await mkdir(processedDir, { recursive: true });

    // Vytvoření názvu pro zpracovaný soubor
    const originalName = file.name;
    const extIndex = originalName.lastIndexOf('.');
    const baseName = extIndex !== -1 ? originalName.slice(0, extIndex) : originalName;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const newFileName = `${baseName}_zpracovano_${timestamp}.xlsx`;
    const outputPath = path.join(processedDir, newFileName);
    
    // Uložení zpracovaného souboru
    await writeFile(outputPath, Buffer.from(outputBuffer));
    
    return { 
      success: true, 
      fileName: newFileName,
      filePath: `/processed/${newFileName}`,
      nameReport,
      timeReport
    };
  } catch (error) {
    console.error('Chyba při zpracování souboru:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nastala chyba při zpracování souboru'
    };
  }
}

/**
 * Server action pro zpracování Excel souboru - pouze porovnání jmen
 */
export async function processNameComparison(formData: FormData): Promise<ProcessResult> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        error: 'Žádný soubor nebyl nahrán'
      };
    }

    const fileBuffer = await file.arrayBuffer();
    const processor = new ExcelProcessor(fileBuffer);
    const outputBuffer = processor.processNameComparison();
    
    // Získání reportu pro náhled
    const { nameReport } = processor.getReport();
    
    // Vytvoření složky public/processed, pokud neexistuje
    const processedDir = path.join(process.cwd(), 'public', 'processed');
    await mkdir(processedDir, { recursive: true });

    // Vytvoření názvu pro zpracovaný soubor
    const originalName = file.name;
    const extIndex = originalName.lastIndexOf('.');
    const baseName = extIndex !== -1 ? originalName.slice(0, extIndex) : originalName;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const newFileName = `${baseName}_jmena_${timestamp}.xlsx`;
    const outputPath = path.join(processedDir, newFileName);
    
    // Uložení zpracovaného souboru
    await writeFile(outputPath, Buffer.from(outputBuffer));
    
    return { 
      success: true, 
      fileName: newFileName,
      filePath: `/processed/${newFileName}`,
      nameReport
    };
  } catch (error) {
    console.error('Chyba při zpracování jmen:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nastala chyba při porovnávání jmen'
    };
  }
}

/**
 * Server action pro zpracování Excel souboru - pouze aktualizace časů
 */
export async function processTimeUpdate(formData: FormData): Promise<ProcessResult> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        error: 'Žádný soubor nebyl nahrán'
      };
    }

    const fileBuffer = await file.arrayBuffer();
    const processor = new ExcelProcessor(fileBuffer);
    const outputBuffer = processor.processTimeUpdate();
    
    // Získání reportu pro náhled
    const { timeReport } = processor.getReport();
    
    // Vytvoření složky public/processed, pokud neexistuje
    const processedDir = path.join(process.cwd(), 'public', 'processed');
    await mkdir(processedDir, { recursive: true });

    // Vytvoření názvu pro zpracovaný soubor
    const originalName = file.name;
    const extIndex = originalName.lastIndexOf('.');
    const baseName = extIndex !== -1 ? originalName.slice(0, extIndex) : originalName;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const newFileName = `${baseName}_casy_${timestamp}.xlsx`;
    const outputPath = path.join(processedDir, newFileName);
    
    // Uložení zpracovaného souboru
    await writeFile(outputPath, Buffer.from(outputBuffer));
    
    return { 
      success: true, 
      fileName: newFileName,
      filePath: `/processed/${newFileName}`,
      timeReport
    };
  } catch (error) {
    console.error('Chyba při aktualizaci časů:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nastala chyba při aktualizaci časů'
    };
  }
}

/**
 * Server action pro získání náhledu reportu bez uložení souboru
 */
export async function getExcelReport(formData: FormData): Promise<ProcessResult> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        error: 'Žádný soubor nebyl nahrán'
      };
    }

    const fileBuffer = await file.arrayBuffer();
    const processor = new ExcelProcessor(fileBuffer);
    
    // Získání reportu pro náhled
    const { nameReport, timeReport } = processor.getReport();
    
    return { 
      success: true,
      nameReport,
      timeReport
    };
  } catch (error) {
    console.error('Chyba při generování reportu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nastala chyba při generování reportu'
    };
  }
}