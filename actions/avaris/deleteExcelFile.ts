// app/actions/avaris/deleteExcelFile.ts
'use server'

import { unlink } from 'fs/promises';
import path from 'path';

type DeleteResult = {
  success: boolean;
  error?: string;
}

export async function deleteExcelFile(fileName: string): Promise<DeleteResult> {
  try {
    // Kontrola, zda název souboru je validní
    if (!fileName || !fileName.toLowerCase().endsWith('.xlsx')) {
      return {
        success: false,
        error: 'Neplatný název souboru'
      };
    }
    
    // Cesta k souboru
    const filePath = path.join(process.cwd(), 'public', 'downloads', fileName);
    
    // Odstranění souboru
    await unlink(filePath);
    
    return { 
      success: true
    };
  } catch (error) {
    console.error('Chyba při odstraňování souboru:', error);
    return {
      success: false,
      error: 'Nastala chyba při odstraňování souboru'
    };
  }
}