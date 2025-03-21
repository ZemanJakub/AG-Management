// app/actions/podklady/processExcel.ts
'use server'

import { ExcelProcessor } from '@/modules/podklady/services/excelProcessor';
import { ExcelProcessingError } from '@/modules/podklady/services/errors';
import { cleanupProcessedExcelFiles } from '@/modules/podklady/utils/fileCleanup';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { StructuredLogger } from '@/modules/podklady/services/structuredLogger';
import { PerformanceMonitor } from '@/modules/podklady/services/performanceMonitor';

// Inicializace
const logger = StructuredLogger.getInstance().getComponentLogger('excel-action');
const performanceMonitor = PerformanceMonitor.getInstance();

// Typy pro výsledek zpracování
export type ProcessResult = {
  success: boolean;
  error?: string;
  errorCode?: string; 
  fileName?: string;
  filePath?: string;
  nameReport?: string;
  timeReport?: string;
  consecutiveShiftsReport?: string;
  performanceData?: any;
}

/**
 * Server action pro zpracování Excel souboru - kompletní náhrada maker
 */
export async function processExcelFile(formData: FormData): Promise<ProcessResult> {
  const correlationId = `process_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  logger.setCorrelationId(correlationId);
  logger.addContext('action', 'processExcelFile');
  
  const measurementId = performanceMonitor.startMeasurement('ServerActions.processExcelFile', {
    correlationId
  });
  
  try {
    logger.info('Začínám zpracování Excel souboru');
    
    const file = formData.get('file') as File;
    
    if (!file) {
      logger.warn('Žádný soubor nebyl nahrán');
      performanceMonitor.endMeasurement(measurementId, { error: 'NO_FILE' }, false);
      return {
        success: false,
        error: 'Žádný soubor nebyl nahrán',
        errorCode: 'NO_FILE'
      };
    }

    // Kontrola typu souboru
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      logger.warn(`Neplatný typ souboru: ${file.name}`);
      performanceMonitor.endMeasurement(measurementId, { error: 'INVALID_FILE_TYPE' }, false);
      return {
        success: false,
        error: 'Pouze soubory Excel (.xlsx) jsou povoleny',
        errorCode: 'INVALID_FILE_TYPE'
      };
    }

    logger.info(`Zpracovávám soubor: ${file.name}, velikost: ${file.size} bajtů`);

    // Konverze File na ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Zpracování Excel souboru
    const processor = await ExcelProcessor.create(fileBuffer);
    const outputBuffer = await processor.processAll();
    
    // Získání reportu pro náhled
    const { nameReport, timeReport, consecutiveShiftsReport } = processor.getReport();
    
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
    
    logger.info(`Soubor byl úspěšně zpracován a uložen jako ${newFileName}`);
    
    // Asynchronní čištění starých souborů (nečekáme na dokončení)
    cleanupProcessedExcelFiles().catch(err => 
      logger.error('Chyba při čištění starých souborů:', { error: err })
    );
    
    // Získání statistik výkonu
    const performanceData = performanceMonitor.getStatistics();
    performanceMonitor.endMeasurement(measurementId, { success: true });
    
    return { 
      success: true, 
      fileName: newFileName,
      filePath: `/processed/${newFileName}`,
      nameReport,
      timeReport,
      consecutiveShiftsReport,
      performanceData
    };
  } catch (error) {
    logger.error('Chyba při zpracování souboru:', { error });
    
    // Specializované zpracování chyb
    if (error instanceof ExcelProcessingError) {
      performanceMonitor.endMeasurement(measurementId, { 
        error: error.message,
        errorCode: error.code
      }, false);
      
      return {
        success: false,
        error: error.message,
        errorCode: error.code
      };
    }
    
    performanceMonitor.endMeasurement(measurementId, { 
      error: error instanceof Error ? error.message : 'Neznámá chyba'
    }, false);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nastala chyba při zpracování souboru',
      errorCode: 'UNKNOWN_ERROR'
    };
  }
}