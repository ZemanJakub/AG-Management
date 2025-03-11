// app/actions/avaris/copySheet.ts
'use server';

import ExcelJS from 'exceljs';
import path from 'path';
import { createLogger } from '@/modules/avaris/services/logger';

const logger = createLogger('excel-utils');

type CopySheetResult = {
  success: boolean;
  message?: string;
  error?: string;
  newSheetName?: string; // Přidáno pro návratovou hodnotu s názvem nového listu
}

/**
 * Funkce pro vytvoření nového listu s daty z Avarisu v Excel souboru
 * @param sourceFileName Název zdrojového souboru (ve složce public/downloads)
 * @param targetFileName Název cílového souboru (ve složce public/downloads)
 * @returns Výsledek operace včetně názvu nového listu
 */
export async function copySheet(
  sourceFileName: string, 
  targetFileName: string
): Promise<CopySheetResult> {
  try {
    logger.info(`Přidávám data z ${sourceFileName} do souboru ${targetFileName} jako nový list`);
    
    // Cesty k souborům
    const sourceFilePath = path.join(process.cwd(), 'public', 'downloads', sourceFileName);
    const targetFilePath = path.join(process.cwd(), 'public', 'downloads', targetFileName);

    // Načtení zdrojového souboru
    const sourceWorkbook = new ExcelJS.Workbook();
    await sourceWorkbook.xlsx.readFile(sourceFilePath);
    
    // Získání prvního listu ze zdrojového souboru
    const sourceSheet = sourceWorkbook.worksheets[0];
    if (!sourceSheet) {
      throw new Error(`Zdrojový soubor neobsahuje žádné listy`);
    }
    
    // Načtení cílového souboru
    const targetWorkbook = new ExcelJS.Workbook();
    await targetWorkbook.xlsx.readFile(targetFilePath);
    
    // Vytvoříme unikátní název pro nový list
    const newSheetName = `List2`;
    
    // Zkontrolujeme, zda již neexistuje list s tímto názvem, a pokud ano, smažeme ho
    const existingSheet = targetWorkbook.getWorksheet(newSheetName);
    if (existingSheet) {
      targetWorkbook.removeWorksheet(existingSheet.id);
    }
    
    // Vytvoříme zcela nový list
    const newSheet = targetWorkbook.addWorksheet(newSheetName);
    
    // Přidáme instrukce do buňky A1
    newSheet.getCell('A1').value = 'Data z Avarisu';
    newSheet.getCell('A2').value = 'Pro zpracování spusťte makro v List1';
    newSheet.getCell('A3').value = `Datum generování: ${new Date().toLocaleString('cs-CZ')}`;
    
    // Přidáme hlavičky
    newSheet.getCell('A5').value = 'Den';
    newSheet.getCell('B5').value = 'Čas';
    newSheet.getCell('C5').value = 'Místo';
    
    // Formátování hlavičky
    ['A5', 'B5', 'C5'].forEach(cell => {
      newSheet.getCell(cell).font = { bold: true };
      newSheet.getCell(cell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });
    
    // Načteme data ze zdrojového listu
    const sourceData: any[][] = [];
    sourceSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Přeskočíme první řádek (hlavičky)
      
      const rowData = [];
      // Bereme pouze sloupce B a C (index 2 a 3 v ExcelJS, která čísluje od 1)
      for (let colIndex = 1; colIndex <= 3; colIndex++) {
        const cell = row.getCell(colIndex);
        rowData.push(cell.value);
      }
      
      sourceData.push(rowData);
    });
    
    // Zapíšeme data do nového listu
    sourceData.forEach((rowData, rowIndex) => {
      rowData.forEach((cellValue, colIndex) => {
        const targetRow = rowIndex + 6; // Začínáme od řádku 6 (pod hlavičkou)
        const targetCol = colIndex + 1; // Začínáme od sloupce A (1)
        
        newSheet.getCell(targetRow, targetCol).value = cellValue;
      });
    });
    
    // Nastavíme rozumné šířky sloupců
    newSheet.getColumn(1).width = 12; // Den
    newSheet.getColumn(2).width = 15; // Čas
    newSheet.getColumn(3).width = 30; // Místo
    
    // Nastavíme formát času pro sloupec B (čas)
    for (let i = 0; i < sourceData.length; i++) {
      const cell = newSheet.getCell(i + 6, 2); // Sloupec B
      if (cell.value && typeof cell.value === 'string' && cell.value.includes(':')) {
        // Pouze pokud buňka obsahuje dvojtečku (formát času)
        cell.numFmt = 'h:mm';
      }
    }
    
    // Uložíme změny do cílového souboru
    await targetWorkbook.xlsx.writeFile(targetFilePath);
    
    logger.info(`Nový list '${newSheetName}' byl úspěšně vytvořen v souboru ${targetFileName}`);
    
    return {
      success: true,
      message: `Data byla úspěšně uložena do nového listu '${newSheetName}'. Otevřete Excel a spusťte makro pro jejich zpracování.`,
      newSheetName
    };
  } catch (error) {
    logger.error(`Chyba při vytváření nového listu: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Neznámá chyba'
    };
  }
}

/**
 * Funkce pro zjištění zdrojového a cílového souboru pro kopírování
 * @param result Výsledek z getAvarisData funkce
 * @param uploadedFileName Název souboru nahraného uživatelem
 * @returns Objekt s informacemi o souborech
 */
export async function getFileInfo(result: any, uploadedFileName: string) {
  // Pokud result existuje a má processedData
  if (result && result.processedData) {
    // Hledáme první objekt, který má definovanou vlastnost xlsxFilePath
    for (const [objektName, data] of Object.entries(result.processedData)) {
      // Použijeme as any, abychom obešli TypeScript chyby
      const objData = data as any;
      if (objData && objData.xlsxFilePath) {
        // Extrahujeme název souboru z cesty
        const sourceFileName = objData.xlsxFilePath.split('/').pop();
        if (sourceFileName) {
          return {
            sourceFile: sourceFileName,
            targetFile: uploadedFileName,
            found: true
          };
        }
      }
    }
  }

  // Pokud jsme nenašli soubor
  return {
    sourceFile: null,
    targetFile: uploadedFileName,
    found: false
  };
}