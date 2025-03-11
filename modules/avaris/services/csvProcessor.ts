// modules/avaris/services/csvProcessor.ts
import fs from 'fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';
import { createLogger } from './logger';

const logger = createLogger('csv-processor');

// Interface pro záznam dat
export interface AvarisRecord {
  den: string;
  cas: string;
  misto: string;
  typ: string;
  strazny: string;
  [key: string]: string | undefined; // Pro další dynamické klíče
}

// Interface pro výsledky zpracování
export interface ProcessingResult {
  success: boolean;
  data?: AvarisRecord[];
  summary?: {
    totalRecords: number;
    filteredRecords: number;
    uniqueLocations: string[];
    recordsByLocation: { [key: string]: number };
  };
  error?: string;
  filePath?: string;
  xlsxFilePath?: string;
}

/**
 * Vlastní funkce pro parsování CSV řádků s ohledem na uvozovky
 */
function parseCSVLine(line: string, delimiter: string = ';'): string[] {
  const result: string[] = [];
  let currentValue = "";
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line.charAt(i);
    
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === delimiter && !insideQuotes) {
      result.push(currentValue);
      currentValue = "";
    } else {
      currentValue += char;
    }
  }
  
  // Přidáme poslední hodnotu
  result.push(currentValue);
  
  // Odstraníme uvozovky z hodnot
  return result.map(value => value.replace(/^"/, '').replace(/"$/, ''));
}

/**
 * Funkce pro parsování celého CSV souboru
 */
async function parseCSV(fileContent: string, delimiter: string = ';'): Promise<string[][]> {
  // Rozdělení na řádky
  const lines = fileContent.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Parsování každého řádku
  return lines.map(line => parseCSVLine(line, delimiter));
}

/**
 * Funkce pro řešení cesty k souboru
 * Zajistí, že cesta je správně transformována na absolutní cestu v projektu
 */
function resolveFilePath(filePath: string): string {
  // Pokud začíná lomítkem, je to relativní cesta od kořene projektu
  if (filePath.startsWith('/')) {
    return path.join(process.cwd(), 'public', filePath.substring(1));
  }
  
  // Pokud začíná 'downloads/', je to také relativní cesta
  if (filePath.startsWith('downloads/')) {
    return path.join(process.cwd(), 'public', filePath);
  }
  
  // Pokud je už absolutní cesta, vrátíme ji
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  
  // Jinak předpokládáme, že je to relativní cesta od kořene projektu
  return path.join(process.cwd(), 'public', filePath);
}

/**
 * Funkce pro čtení a parsování CSV souboru z Avarisu
 * @param filePath Cesta k CSV souboru
 * @returns Zpracovaná data a metadata
 */
async function processAvarisCSV(filePath: string): Promise<{
  records: AvarisRecord[];
  stRecords: AvarisRecord[]; // Záznamy s příznakem ST
  nonStRecords: AvarisRecord[]; // Záznamy bez příznaku ST
}> {
  try {
    // Řešíme cestu k souboru
    const absolutePath = resolveFilePath(filePath);
    
    logger.info(`Čtení CSV souboru: ${absolutePath}`);
    
    // Přečteme soubor
    const fileContent = await fs.readFile(absolutePath, { encoding: 'utf-8' });
    
    // Parsování CSV
    const rows = await parseCSV(fileContent);
    
    logger.info(`CSV úspěšně načteno, počet řádků: ${rows.length}`);
    
    // Hledáme index řádku s hlavičkami
    let headerRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.some(cell => cell.includes("Čas načtení"))) {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      throw new Error("Nepodařilo se najít hlavičky v CSV souboru");
    }
    
    // Extrahujeme data po hlavičkách
    const dataRows = rows.slice(headerRowIndex + 1);
    
    // Příprava formátovaných záznamů
    const records: AvarisRecord[] = [];
    const stRecords: AvarisRecord[] = [];
    const nonStRecords: AvarisRecord[] = [];
    
    dataRows.forEach(row => {
      if (row.length === 0) return;
      
      // Kontrola pro specifický formát Avaris CSV
      if (row.length === 1 && row[0].includes(',')) {
        // Pokud máme jen jednu hodnotu, ale obsahuje čárky, rozdělíme ji
        const parts = row[0].split(',').map(part => part.trim().replace(/^"/, '').replace(/"$/, ''));
        
        // Kontrola, zda máme dostatek částí
        if (parts.length < 5) return;
        
        // Vytvoříme záznam
        const record: AvarisRecord = {
          den: parts[0] || '',
          cas: parts[1] || '',
          misto: parts[2] || '',
          typ: parts[3] || '',
          strazny: parts[4] || '',
        };
        
        // Přidáme do správné kategorie
        records.push(record);
        
        if (record.typ === 'ST') {
          stRecords.push(record);
        } else {
          nonStRecords.push(record);
        }
      } else if (row.length >= 5) {
        // Standardní zpracování, pokud máme dostatek sloupců
        const record: AvarisRecord = {
          den: row[0] || '',
          cas: row[1] || '',
          misto: row[2] || '',
          typ: row[3] || '',
          strazny: row[4] || '',
        };
        
        records.push(record);
        
        if (record.typ === 'ST') {
          stRecords.push(record);
        } else {
          nonStRecords.push(record);
        }
      }
    });
    
    logger.info(`Zpracováno ${records.length} záznamů, z toho ${stRecords.length} ST a ${nonStRecords.length} ne-ST`);
    
    return {
      records,
      stRecords,
      nonStRecords
    };
  } catch (error) {
    logger.error(`Chyba při čtení a parsování CSV souboru: ${error}`);
    throw error;
  }
}

/**
 * Pomocná funkce pro převod času z řetězce na excelovou časovou hodnotu
 * @param timeStr Řetězec s časem ve formátu "HH:MM:SS" nebo "DD.MM.YYYY HH:MM:SS"
 * @returns Excel Serial Number pro čas
 */
function excelTimeValue(timeStr: string): number {
  try {
    // Očekávaný formát: "DD.MM.YYYY HH:MM:SS" nebo jen "HH:MM:SS"
    const parts = timeStr.split(' ');
    let timeOnly = parts.length > 1 ? parts[1] : parts[0];
    
    // Rozdělíme čas na hodiny, minuty, sekundy
    const timeParts = timeOnly.split(':');
    if (timeParts.length < 2) return 0;
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
    
    // Výpočet excel časové hodnoty (hodiny/24 + minuty/1440 + sekundy/86400)
    return hours / 24 + minutes / 1440 + seconds / 86400;
  } catch (error) {
    logger.error(`Chyba při konverzi času na excel časovou hodnotu: ${error}`);
    return 0;
  }
}

/**
 * Funkce pro uložení filtrovaných dat do Excel souboru
 */
async function saveFilteredXLSX(originalFilePath: string, records: AvarisRecord[]): Promise<string> {
  try {
    // Vytvoříme cestu pro nový soubor
    const parsedPath = path.parse(originalFilePath);
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    const newFileName = `${parsedPath.name}_filtered.xlsx`;
    const newFilePath = path.join(downloadsDir, newFileName);
    
    // Ujistíme se, že adresář existuje
    await fs.mkdir(downloadsDir, { recursive: true });
    
    logger.info(`Ukládám filtrovaný soubor do Excel XLSX: ${newFilePath}`);
    
    // Vytvoříme nový workbook
    const workbook = XLSX.utils.book_new();
    
    // Připravíme data pro list - pouze filtrovaná data bez sloupců Typ a Strážný
    const sheetData = [
      // První řádek - hlavičky
      ['', 'Čas načtení', 'Název bodu', '']
    ];
    
    // Přidáme filtrovaná data
    records.forEach(record => {
      sheetData.push([
        record.den, 
        record.cas, 
        record.misto,
        '' // Prázdná buňka pro časovou hodnotu, kterou nastavíme níže
      ]);
    });
    
    // Vytvoříme list
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    
    // Nastavíme šířky sloupců
    const colWidths = [
      { wch: 10 },  // A
      { wch: 20 },  // B
      { wch: 30 },  // C
      { wch: 10 },  // D
    ];
    
    sheet['!cols'] = colWidths;
    
    // Nastavíme formát buněk pro sloupec D (časové hodnoty)
    // Procházíme všechny buňky (od řádku 2, kde začínají data)
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:D1');
    
    for (let R = 1; R <= range.e.r; ++R) {
      // Přeskočíme řádek s hlavičkou
      if (R === 0) continue;
      
      // Získáme buňku s časem (sloupec B)
      const timeRef = XLSX.utils.encode_cell({ r: R, c: 1 });
      const timeCell = sheet[timeRef];
      
      // Pokud existuje buňka s časem
      if (timeCell && timeCell.v) {
        // Získáme čas jako řetězec
        const timeStr = String(timeCell.v);
        
        // Vytvoříme referenci na buňku ve sloupci D
        const cellRef = XLSX.utils.encode_cell({ r: R, c: 3 });
        
        // Vytvoříme buňku s časovou hodnotou a formátováním
        sheet[cellRef] = { 
          t: 'n', // typ číslo
          v: excelTimeValue(timeStr), // hodnota času
          z: 'h:mm' // formátování zobrazení jako "7:15"
        };
      }
    }
    
    // Přidáme list do workbooku
    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
    
    // Uložíme workbook
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    await fs.writeFile(newFilePath, excelBuffer);
    
    logger.info(`Filtrovaná data úspěšně uložena do XLSX`);
    
    // Vrátíme URL cestu pro použití v prohlížeči
    return `/downloads/${newFileName}`;
  } catch (error) {
    logger.error(`Chyba při ukládání filtrovaného XLSX: ${error}`);
    throw error;
  }
}

/**
 * Pomocná funkce pro získání rozsahu dat
 */
function getDateRange(records: AvarisRecord[]): { from: string, to: string } {
  if (records.length === 0) {
    return { from: '', to: '' };
  }
  
  // Parsování dat
  const dates = records.map(record => {
    const dateParts = record.cas.split(' ')[0].split('.');
    if (dateParts.length === 3) {
      return new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    }
    return new Date();
  });
  
  // Nalezení min a max
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  // Formátování
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} 00:00:00`;
  };
  
  return {
    from: formatDate(minDate),
    to: formatDate(maxDate)
  };
}

/**
 * Funkce pro odstranění souborů z adresáře downloads
 */
async function cleanupFiles(xlsxPath: string): Promise<void> {
  try {
    // Získáme absolutní cestu k souboru
    const absoluteXlsxPath = resolveFilePath(xlsxPath);
    
    // Nastavíme timer na smazání souboru po 5 minutách (300000 ms)
    setTimeout(async () => {
      try {
        await fs.unlink(absoluteXlsxPath);
        logger.info(`Soubor ${absoluteXlsxPath} byl smazán`);
      } catch (error) {
        logger.error(`Chyba při mazání souboru ${absoluteXlsxPath}: ${error}`);
      }
    }, 300000);
    
    logger.info(`Nastaveno smazání souboru ${absoluteXlsxPath} po 5 minutách`);
  } catch (error) {
    logger.error(`Chyba při nastavování smazání souborů: ${error}`);
  }
}

/**
 * Funkce pro zpracování dat z Avarisu a vytvoření souhrnných statistik
 */
export async function processAvarisData(filePath: string): Promise<ProcessingResult> {
  try {
    logger.info(`Začínám zpracování Avaris dat z: ${filePath}`);
    
    // Zpracujeme CSV
    const { records, stRecords, nonStRecords } = await processAvarisCSV(filePath);
    
    if (records.length === 0) {
      logger.warn(`Soubor ${filePath} neobsahuje žádná data`);
      return {
        success: false,
        error: 'Soubor neobsahuje žádná data',
        filePath
      };
    }
    
    // Uložíme filtrovaná data jako XLSX
    const xlsxFilePath = await saveFilteredXLSX(filePath, stRecords);
    
    // Nastavíme smazání souboru po stažení
    await cleanupFiles(xlsxFilePath);
    
    // Vytvoříme souhrnné statistiky - použijeme Map místo Set
    const locationMap = new Map<string, boolean>();
    records.forEach(record => locationMap.set(record.misto, true));
    const uniqueLocations = Array.from(locationMap.keys());
    
    // Počet záznamů podle místa
    const recordsByLocation: { [key: string]: number } = {};
    records.forEach(record => {
      const location = record.misto;
      recordsByLocation[location] = (recordsByLocation[location] || 0) + 1;
    });
    
    logger.info(`Zpracování dokončeno, vyfiltrováno ${stRecords.length} ST záznamů z celkových ${records.length}`);
    
    return {
      success: true,
      data: stRecords,
      summary: {
        totalRecords: records.length,
        filteredRecords: records.length - stRecords.length, // Počet odfiltrovaných záznamů, tedy ty, které nejsou ST
        uniqueLocations,
        recordsByLocation
      },
      filePath,
      xlsxFilePath
    };
  } catch (error) {
    logger.error(`Chyba při zpracování Avaris dat: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Neznámá chyba při zpracování dat',
      filePath
    };
  }
}

/**
 * Funkce pro dávkové zpracování více CSV souborů
 */
export async function batchProcessAvarisData(filePaths: { [key: string]: string }): Promise<{ [key: string]: ProcessingResult }> {
  logger.info(`Začínám dávkové zpracování ${Object.keys(filePaths).length} souborů`);
  
  const results: { [key: string]: ProcessingResult } = {};
  
  for (const [objektName, filePath] of Object.entries(filePaths)) {
    logger.info(`Zpracovávám data pro objekt ${objektName}: ${filePath}`);
    
    try {
      results[objektName] = await processAvarisData(filePath);
    } catch (error) {
      logger.error(`Chyba při zpracování dat pro objekt ${objektName}: ${error}`);
      results[objektName] = {
        success: false,
        error: error instanceof Error ? error.message : 'Neznámá chyba',
        filePath
      };
    }
  }
  
  logger.info(`Dávkové zpracování dokončeno, zpracováno ${Object.keys(results).length} souborů`);
  
  return results;
}