// app/actions/avaris/saveExcelFile.ts
'use server'

import { getFilePath, getFileUrl } from '@/modules/podklady/utils/excelUtils';
import { createLogger } from '@/modules/podklady/services/logger';
import { mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';

const logger = createLogger('save-excel-file');

type SaveResult = {
  success: boolean;
  error?: string;
  fileName?: string;
  filePath?: string;
}

export async function saveExcelFile(formData: FormData): Promise<SaveResult> {
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

    // Vytvoření složky public/downloads, pokud neexistuje
    const downloadDir = path.join(process.cwd(), 'public', 'downloads');
    await mkdir(downloadDir, { recursive: true });

    // Příprava cesty pro uložení souboru
    const filePath = getFilePath('downloads', file.name);
    
    // Konverze File na ArrayBuffer a následně na Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Zápis souboru do složky
    await fs.writeFile(filePath, buffer);
    
    return { 
      success: true, 
      fileName: file.name,
      filePath: getFileUrl('downloads', file.name) // Relativní cesta dostupná z front-endu
    };
  } catch (error) {
    logger.error('Chyba při ukládání souboru:', error);
    return {
      success: false,
      error: 'Nastala chyba při ukládání souboru'
    };
  }
}