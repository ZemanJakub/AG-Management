// modules/podklady/interfaces/INameComparisonService.ts

import ExcelJS from 'exceljs';
import { NameComparisonOutput } from '../services/nameComparisonService';

export interface INameComparisonService {
  /**
   * Načte data z bufferu
   * @param buffer Buffer nebo ArrayBuffer s Excel daty
   */
  loadFromBuffer(buffer: Buffer | ArrayBuffer): Promise<void>;
  
  /**
   * Provede porovnání a korekci jmen
   * @returns Výsledky porovnání
   */
  compareAndFixNames(): Promise<NameComparisonOutput>;
  
  /**
   * Vygeneruje HTML report z výsledků porovnání
   * @param results Výsledky porovnání
   * @returns HTML report
   */
  generateReport(results: NameComparisonOutput): string;
  
  /**
   * Získá výstupní buffer
   * @returns Buffer s Excel souborem
   */
  getOutputBuffer(): Promise<Buffer>;
}