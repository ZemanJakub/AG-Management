// app/actions/admin/logActions.ts
"use server";

import { StructuredLogger } from '@/modules/podklady/services/structuredLogger';
import fs from 'fs';
import path from 'path';

const logger = StructuredLogger.getInstance();

/**
 * Výsledek získání seznamu log souborů
 */
type LogFilesResult = {
  success: boolean;
  error?: string;
  files?: string[];
}

/**
 * Výsledek získání obsahu log souboru
 */
type LogContentResult = {
  success: boolean;
  error?: string;
  content?: string;
}

/**
 * Výsledek nastavení úrovně logování
 */
type LogLevelResult = {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Výsledek získání log souboru jako Base64
 */
type LogFileBase64Result = {
  success: boolean;
  error?: string;
  filename: string;
  contentType: string;
  base64Content: string;
}

/**
 * Server Action pro získání seznamu log souborů
 * @returns Objekt se seznamem log souborů nebo chybou
 */
export async function getLogFiles(): Promise<LogFilesResult> {
  try {
    // Kontrola, zda je logování do souboru povoleno
    if (!logger.isFileLoggingEnabled()) {
      return { success: false, error: 'Logování do souboru není povoleno' };
    }
    
    const files = logger.getLogFiles();
    return { success: true, files };
  } catch (error) {
    console.error('Chyba při načítání seznamu logů:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Nepodařilo se načíst seznam logů' 
    };
  }
}

/**
 * Server Action pro získání obsahu log souboru
 * @param filename Název log souboru
 * @param maxLines Maximální počet řádků, které se mají načíst (od konce souboru)
 * @returns Objekt s obsahem log souboru nebo chybou
 */
export async function getLogFileContent(filename: string, maxLines: number = 1000): Promise<LogContentResult> {
  try {
    // Kontrola, zda je logování do souboru povoleno
    if (!logger.isFileLoggingEnabled()) {
      return { success: false, error: 'Logování do souboru není povoleno' };
    }
    
    // Bezpečnostní kontrola názvu souboru
    if (!filename || !filename.endsWith('.log') || filename.includes('..') || filename.includes('/')) {
      return { success: false, error: 'Neplatný název log souboru' };
    }
    
    const content = logger.getLogFileContent(filename, maxLines);
    
    if (content === null) {
      return { success: false, error: 'Log soubor neexistuje nebo nastala chyba při čtení' };
    }
    
    return { success: true, content };
  } catch (error) {
    console.error(`Chyba při načítání log souboru '${filename}':`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Nepodařilo se načíst log soubor' 
    };
  }
}

/**
 * Server Action pro nastavení úrovně logování
 * @param level Nová úroveň logování (error, warn, info, debug)
 * @returns Objekt s informací o úspěchu nebo chybou
 */
export async function setLogLevel(level: string): Promise<LogLevelResult> {
  try {
    // Validace úrovně logování
    const validLevels = ['error', 'warn', 'info', 'debug'];
    
    if (!validLevels.includes(level.toLowerCase())) {
      return { success: false, error: 'Neplatná úroveň logování' };
    }
    
    // Nastavení proměnné prostředí
    process.env.LOG_LEVEL = level.toLowerCase();
    
    return { success: true, message: `Úroveň logování nastavena na: ${level.toLowerCase()}` };
  } catch (error) {
    console.error(`Chyba při nastavování úrovně logování:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Nepodařilo se nastavit úroveň logování' 
    };
  }
}

/**
 * Server Action pro stažení log souboru - vrací Base64 zakódovaný obsah souboru
 * @param filename Název log souboru
 * @returns Objekt s obsahem souboru v Base64 nebo chybou
 */
export async function getLogFileBase64(filename: string): Promise<LogFileBase64Result | { success: false, error: string }> {
  try {
    // Kontrola, zda je logování do souboru povoleno
    if (!logger.isFileLoggingEnabled()) {
      return { success: false, error: 'Logování do souboru není povoleno' };
    }
    
    // Bezpečnostní kontrola názvu souboru
    if (!filename || !filename.endsWith('.log') || filename.includes('..') || filename.includes('/')) {
      return { success: false, error: 'Neplatný název log souboru' };
    }
    
    const logDir = logger.getLogDirectory();
    const filePath = path.join(logDir, filename);
    
    // Kontrola, zda soubor existuje
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'Log soubor neexistuje' };
    }
    
    // Načtení obsahu souboru jako Buffer
    const fileBuffer = fs.readFileSync(filePath);
    
    // Převod na Base64
    const base64Content = fileBuffer.toString('base64');
    
    return { 
      success: true, 
      filename, // Použijeme poskytnutý název souboru
      contentType: 'text/plain',
      base64Content
    };
  } catch (error) {
    console.error(`Chyba při načítání log souboru '${filename}' jako Base64:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Nepodařilo se načíst log soubor' 
    };
  }
}