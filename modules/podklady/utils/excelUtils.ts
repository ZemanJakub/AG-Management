// modules/podklady/utils/excelUtils.ts
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs/promises";
import { createLogger } from "@/modules/podklady/services/logger";

const logger = createLogger("excel-utils");

/**
 * Funkce pro načítání Excel souboru pomocí ExcelJS
 * @param filePath Cesta k souboru
 * @returns Workbook objekt
 */
export async function loadExcelFile(filePath: string): Promise<ExcelJS.Workbook> {
  try {
    logger.info(`Načítám Excel soubor: ${filePath}`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    return workbook;
  } catch (error) {
    logger.error(`Chyba při načítání Excel souboru: ${error}`);
    throw new Error(`Nepodařilo se načíst Excel soubor: ${error instanceof Error ? error.message : "Neznámá chyba"}`);
  }
}

/**
 * Funkce pro načítání Excel souboru z ArrayBuffer
 * @param data ArrayBuffer obsahující Excel data
 * @returns Workbook objekt
 */
export async function loadExcelFromArrayBuffer(data: ArrayBuffer): Promise<ExcelJS.Workbook> {
  try {
    logger.info(`Načítám Excel soubor z ArrayBuffer`);
    const workbook = new ExcelJS.Workbook();
    
    // Pro ArrayBuffer použijeme XLSX.js, který má lepší kompatibilitu s webovými API
    const xlsx = await import('xlsx');
    
    const uint8Array = new Uint8Array(data);
    const workbookXLSX = xlsx.read(uint8Array, { type: 'array' });
    
    // Převedeme XLSX workbook na ExcelJS workbook
    for (const sheetName of workbookXLSX.SheetNames) {
      const sheet = workbookXLSX.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      
      const worksheet = workbook.addWorksheet(sheetName);
      jsonData.forEach((row: any, rowIndex: number) => {
        if (Array.isArray(row)) {
          row.forEach((cellValue: any, colIndex: number) => {
            worksheet.getCell(rowIndex + 1, colIndex + 1).value = cellValue;
          });
        }
      });
    }
    
    return workbook;
  } catch (error) {
    logger.error(`Chyba při načítání Excel souboru z ArrayBuffer: ${error}`);
    throw new Error(`Nepodařilo se načíst Excel soubor z ArrayBuffer: ${error instanceof Error ? error.message : "Neznámá chyba"}`);
  }
}

/**
 * Funkce pro načítání Excel souboru z Node.js Buffer
 * @param data Node.js Buffer obsahující Excel data
 * @returns Workbook objekt
 */
export async function loadExcelFromBuffer(data: any): Promise<ExcelJS.Workbook> {
  try {
    logger.info(`Načítám Excel soubor z Buffer`);
    const workbook = new ExcelJS.Workbook();
    
    // Pro Buffer použijeme standardní metodu a ignorujeme typové problémy
    // @ts-ignore
    return await workbook.xlsx.load(data);
  } catch (error) {
    logger.error(`Chyba při načítání Excel souboru z Buffer: ${error}`);
    throw new Error(`Nepodařilo se načíst Excel soubor z Buffer: ${error instanceof Error ? error.message : "Neznámá chyba"}`);
  }
}

/**
 * Obecná funkce pro načítání Excel souboru z jakéhokoliv datového zdroje
 * @param data Buffer nebo ArrayBuffer obsahující Excel data
 * @returns Workbook objekt
 */
export async function loadExcelData(data: any): Promise<ExcelJS.Workbook> {
  if (data instanceof ArrayBuffer) {
    return loadExcelFromArrayBuffer(data);
  } else {
    return loadExcelFromBuffer(data);
  }
}

/**
 * Funkce pro uložení Excel souboru
 * @param workbook Workbook objekt
 * @param filePath Cesta k souboru
 */
export async function saveExcelFile(workbook: ExcelJS.Workbook, filePath: string): Promise<void> {
  try {
    logger.info(`Ukládám Excel soubor: ${filePath}`);
    
    // Ujistíme se, že adresář existuje
    const dirPath = path.dirname(filePath);
    await fs.mkdir(dirPath, { recursive: true });
    
    await workbook.xlsx.writeFile(filePath);
    logger.info(`Excel soubor byl úspěšně uložen: ${filePath}`);
  } catch (error) {
    logger.error(`Chyba při ukládání Excel souboru: ${error}`);
    throw new Error(`Nepodařilo se uložit Excel soubor: ${error instanceof Error ? error.message : "Neznámá chyba"}`);
  }
}

/**
 * Funkce pro kontrolu existence souboru
 * @param filePath Cesta k souboru
 * @returns true pokud soubor existuje, jinak false
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Funkce pro vytvoření cesty k souboru v rámci projektu
 * @param subdirectory Podsložka (např. 'downloads', 'processed', atd.)
 * @param fileName Název souboru
 * @returns Absolutní cesta k souboru
 */
export function getFilePath(subdirectory: string, fileName: string): string {
  return path.join(process.cwd(), 'public', subdirectory, fileName);
}

/**
 * Funkce pro získání URL cesty k souboru pro použití v prohlížeči
 * @param subdirectory Podsložka (např. 'downloads', 'processed', atd.)
 * @param fileName Název souboru
 * @returns URL cesta k souboru
 */
export function getFileUrl(subdirectory: string, fileName: string): string {
  return `/${subdirectory}/${fileName}`;
}

/**
 * Funkce pro převod data z Excelu na JavaScript Date
 * @param excelDate Excel datum (sériové číslo)
 * @returns JavaScript Date objekt
 */
export function excelDateToJsDate(excelDate: number): Date {
  // Excel epocha začíná 1.1.1900, ale JS epocha začíná 1.1.1970
  // Navíc Excel má chybu, kde 1900 je považován za přestupný rok
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const excelEpoch = new Date(1900, 0, 1);
  
  // Odečtení 1 dne pro opravu chyby Excel přestupného roku (pokud je datum po 28.2.1900)
  let daysSinceEpoch = excelDate - 1;
  
  if (excelDate >= 60) {
    daysSinceEpoch--; // Korekce pro chybu přestupného roku 1900
  }
  
  const msFromEpoch = daysSinceEpoch * millisecondsPerDay;
  return new Date(excelEpoch.getTime() + msFromEpoch);
}

/**
 * Funkce pro převod Excel času na JavaScript Date
 * @param excelTime Excel čas (desetinná část dne)
 * @returns JavaScript Date objekt
 */
export function excelTimeToJsDate(excelTime: number): Date {
  // Excel čas je reprezentován jako desetinná část dne (0.5 = 12 hodin)
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const date = new Date(0); // 1970-01-01
  
  const milliseconds = Math.round(excelTime * millisecondsInDay);
  date.setUTCMilliseconds(milliseconds);
  
  return date;
}

/**
 * Funkce pro vytvoření Excel časové hodnoty
 * @param hours Hodiny
 * @param minutes Minuty
 * @param seconds Sekundy
 * @returns Excel časová hodnota (desetinná část dne)
 */
export function createExcelTime(hours: number, minutes: number, seconds: number = 0): number {
  return hours / 24 + minutes / 1440 + seconds / 86400;
}

/**
 * Formátování času z JS Date na řetězec ve formátu "HH:MM"
 * @param date JavaScript Date objekt
 * @returns Formátovaný čas
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Funkce pro parsování časového údaje ve formátu "DD.MM.YYYY HH:MM:SS" nebo "HH:MM:SS"
 * @param timeStr Časový údaj jako řetězec
 * @returns JavaScript Date objekt
 */
export function parseTimestamp(timeStr: string): Date {
  if (!timeStr) throw new Error("Prázdný časový údaj");
  
  // Formát může být "DD.MM.YYYY HH:MM:SS" nebo jen "HH:MM:SS"
  const parts = timeStr.split(' ');
  
  if (parts.length > 1) {
    // Formát "DD.MM.YYYY HH:MM:SS"
    const dateParts = parts[0].split('.');
    const timeParts = parts[1].split(':');
    
    if (dateParts.length === 3 && timeParts.length >= 2) {
      return new Date(
        parseInt(dateParts[2]),  // rok
        parseInt(dateParts[1]) - 1,  // měsíc (0-11)
        parseInt(dateParts[0]),  // den
        parseInt(timeParts[0]),  // hodina
        parseInt(timeParts[1]),  // minuta
        timeParts.length > 2 ? parseInt(timeParts[2]) : 0  // sekunda
      );
    }
  } else if (parts[0].includes(':')) {
    // Formát je jen "HH:MM:SS", použijeme aktuální datum
    const timeParts = parts[0].split(':');
    
    if (timeParts.length >= 2) {
      const now = new Date();
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        parseInt(timeParts[0]),  // hodina
        parseInt(timeParts[1]),  // minuta
        timeParts.length > 2 ? parseInt(timeParts[2]) : 0  // sekunda
      );
    }
  }
  
  throw new Error(`Nepodporovaný formát časového údaje: ${timeStr}`);
}

/**
 * Funkce pro formátování datumu ve formátu "DD.MM.YYYY"
 * @param date JavaScript Date objekt
 * @returns Formátovaný datum
 */
export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Funkce pro formátování datumu a času ve formátu "DD.MM.YYYY HH:MM:SS"
 * @param date JavaScript Date objekt
 * @returns Formátovaný datum a čas
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}:00`;
}

/**
 * Funkce pro formátování datumu ve formátu "YYYY-MM-DD" na "DD.MM.YYYY"
 * @param dateStr Datum ve formátu "YYYY-MM-DD"
 * @returns Formátovaný datum
 */
export function formatDateString(dateStr: string): string {
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
 * Funkce pro vytvoření unikátního názvu souboru s časovým razítkem
 * @param baseName Základní název souboru (bez přípony)
 * @param suffix Přípona nebo další text k přidání před časové razítko
 * @param extension Přípona souboru (např. 'xlsx')
 * @returns Unikátní název souboru
 */
export function createUniqueFileName(baseName: string, suffix: string = "", extension: string = "xlsx"): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${baseName}${suffix ? `_${suffix}` : ""}_${timestamp}.${extension}`;
}

/**
 * Funkce pro extrakci názvu souboru z cesty
 * @param filePath Cesta k souboru
 * @returns Název souboru
 */
export function extractFileName(filePath: string): string {
  return path.basename(filePath);
}

/**
 * Funkce pro extrakci části názvu souboru bez přípony
 * @param fileName Název souboru
 * @returns Název souboru bez přípony
 */
export function extractBaseName(fileName: string): string {
  const extIndex = fileName.lastIndexOf(".");
  return extIndex !== -1 ? fileName.slice(0, extIndex) : fileName;
}