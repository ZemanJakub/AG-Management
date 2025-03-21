// app/actions/avaris/saveExcelFile.ts
'use server'

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { StructuredLogger } from '@/modules/podklady/services/structuredLogger';

// Inicializace StructuredLogger místo console.log
const logger = StructuredLogger.getInstance().getComponentLogger('save-excel-file');

type SaveResult = {
  success: boolean;
  error?: string;
  fileName?: string;
  filePath?: string;
}

export async function saveExcelFile(formData: FormData): Promise<SaveResult> {
  try {
    logger.info('Začínám ukládání nahraného Excel souboru');
    
    const file = formData.get('file') as File;
    
    if (!file) {
      logger.warn('Žádný soubor nebyl nahrán');
      return {
        success: false,
        error: 'Žádný soubor nebyl nahrán'
      };
    }

    // Kontrola typu souboru
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      logger.warn(`Nepodporovaný typ souboru: ${file.name}`);
      return {
        success: false,
        error: 'Pouze soubory Excel (.xlsx) jsou povoleny'
      };
    }

    logger.info(`Ukládám soubor: ${file.name}, velikost: ${file.size} bajtů`);

    // Vytvoření složky public/downloads, pokud neexistuje
    const downloadDir = path.join(process.cwd(), 'public', 'downloads');
    await mkdir(downloadDir, { recursive: true });

    // Příprava cesty pro uložení souboru
    const filePath = path.join(downloadDir, file.name);
    
    // Konverze File na ArrayBuffer a následně na Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Zápis souboru do složky
    await writeFile(filePath, buffer);
    
    logger.info(`Soubor úspěšně uložen: ${filePath}`);
    
    return { 
      success: true, 
      fileName: file.name,
      filePath: `/downloads/${file.name}` // Relativní cesta dostupná z front-endu
    };
  } catch (error) {
    logger.error('Chyba při ukládání souboru:', {
      error: error instanceof Error ? error.message : 'Neznámá chyba',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return {
      success: false,
      error: 'Nastala chyba při ukládání souboru'
    };
  }
}