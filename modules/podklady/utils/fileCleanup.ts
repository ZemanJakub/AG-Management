// modules/podklady/utils/fileCleanup.ts
import fs from 'fs/promises';
import path from 'path';
import { StructuredLogger } from "@/modules/podklady/services/structuredLogger";

const logger = StructuredLogger.getInstance().getComponentLogger("file-cleanup");

/**
 * Vyčistí staré dočasné soubory ze složky
 * @param directory Cesta ke složce, kde jsou soubory
 * @param olderThanHours Počet hodin, po kterých je soubor považován za starý
 * @param filePattern Vzor pro názvy souborů (RegExp)
 */
export async function cleanupOldFiles(
  directory: string,
  olderThanHours: number = 24,
  filePattern?: RegExp
): Promise<void> {
  try {
    logger.info(`Čištění starých souborů ve složce ${directory}`, { directory, olderThanHours });
    
    // Kontrola existence složky
    try {
      await fs.access(directory);
    } catch {
      logger.warn(`Složka ${directory} neexistuje, čištění přeskočeno`, { directory });
      return;
    }
    
    // Načtení seznamu souborů
    const files = await fs.readdir(directory);
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const file of files) {
      // Pokud existuje vzor, kontrolujeme shodu
      if (filePattern && !filePattern.test(file)) {
        continue;
      }
      
      const filePath = path.join(directory, file);
      
      try {
        const stats = await fs.stat(filePath);
        
        // Pokud je soubor starší než X hodin, smažeme ho
        if (now - stats.mtimeMs > olderThanHours * 60 * 60 * 1000) {
          await fs.unlink(filePath);
          cleanedCount++;
          logger.info(`Odstraněn starý soubor: ${filePath}`, { filePath });
        }
      } catch (error) {
        logger.error(`Chyba při zpracování souboru ${filePath}`, { error, filePath });
      }
    }
    
    logger.info(`Čištění dokončeno, odstraněno ${cleanedCount} souborů`, { cleanedCount, directory });
  } catch (error) {
    logger.error(`Chyba při čištění starých souborů`, { error, directory });
  }
}

/**
 * Vyčistí staré zpracované Excel soubory
 * @param olderThanHours Počet hodin, po kterých je soubor považován za starý
 */
export async function cleanupProcessedExcelFiles(olderThanHours: number = 24): Promise<void> {
  const processedDir = path.join(process.cwd(), 'public', 'processed');
  // Vzor pro zpracované soubory (obsahují timestamp)
  const filePattern = /.*_zpracovano_|_jmena_|_casy_.*\.xlsx$/;
  
  await cleanupOldFiles(processedDir, olderThanHours, filePattern);
}