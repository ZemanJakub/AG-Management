// modules/podklady/interfaces/IExcelIntegrationService.ts

import { ProcessingResult, ProcessingOptions } from '../services/excelIntegrationService';
import ExcelJS from 'exceljs';

export interface IExcelIntegrationService {
  /**
   * Načte Excel soubor z dat
   * @param data Data Excel souboru
   * @returns true pokud načtení bylo úspěšné
   */
  loadFile(data: ArrayBuffer | Buffer): Promise<boolean>;
  
  /**
   * Provede kompletní zpracování souboru
   * @param options Možnosti zpracování
   * @returns Výsledek zpracování
   */
  processAll(options?: ProcessingOptions): Promise<ProcessingResult>;
  
  /**
   * Zpracuje porovnání jmen
   * @param options Možnosti zpracování
   * @returns Výsledek zpracování
   */
  processNameComparison(options?: { applyChanges?: boolean }): Promise<ProcessingResult>;
  
  /**
   * Zpracuje aktualizaci časů
   * @param options Možnosti zpracování
   * @returns Výsledek zpracování
   */
  processTimeUpdate(options?: { 
    detectConsecutiveShifts?: boolean;
    timeWindowHours?: number;
    applyChanges?: boolean;
  }): Promise<ProcessingResult>;
  
  /**
   * Získá report bez aplikace změn
   * @returns Výsledek zpracování s reporty
   */
  getReport(): Promise<ProcessingResult>;
  
  /**
   * Získá výstupní buffer workbooku
   * @returns Buffer s Excel souborem nebo null při chybě
   */
  getOutputBuffer(): Promise<Buffer | null>;
}