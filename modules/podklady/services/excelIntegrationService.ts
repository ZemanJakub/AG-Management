// modules/podklady/services/excelIntegrationService.ts
import ExcelJS from "exceljs";
import { createLogger } from "./logger";
import { NameComparisonService } from "./nameComparisonService";
import { 
  ShiftData,
  extractShiftsFromList1, 
  extractClockRecordsFromList2, 
  updateExcelWorkbook 
} from "./excelDataExtractor";
import { 
  detectConsecutiveShifts, 
  generateConsecutiveShiftsReport 
} from "./consecutiveShiftDetector";
import { 
  updateShiftTimes, 
  generateTimeUpdateReport 
} from "./shiftTimeProcessor";
import { 
  loadExcelFile, 
  loadExcelFromArrayBuffer, 
  loadExcelFromBuffer 
} from "../utils/excelUtils";

const logger = createLogger("excel-integration-service");

export interface ProcessingOptions {
  compareNames?: boolean;
  updateTimes?: boolean;
  detectConsecutiveShifts?: boolean;
  timeWindowHours?: number;
  applyChanges?: boolean;
}

export interface ProcessingResult {
  success: boolean;
  error?: string;
  nameComparisonReport?: string;
  timeUpdateReport?: string;
  consecutiveShiftsReport?: string;
  workbook?: ExcelJS.Workbook;
}

export class ExcelIntegrationService {
  private workbook: ExcelJS.Workbook | null = null;
  private nameComparisonService: NameComparisonService | null = null;

  /**
   * Načte Excel soubor z dat
   */
  async loadFile(data: ArrayBuffer | Buffer): Promise<boolean> {
    try {
      logger.info("Načítám Excel soubor");
      
      if (data instanceof ArrayBuffer) {
        this.workbook = await loadExcelFromArrayBuffer(data);
      } else {
        this.workbook = await loadExcelFromBuffer(data);
      }
      
      return true;
    } catch (error) {
      logger.error(`Chyba při načítání souboru: ${error}`);
      return false;
    }
  }

  /**
   * Provede kompletní zpracování souboru
   */
  async processAll(options?: ProcessingOptions): Promise<ProcessingResult> {
    if (!this.workbook) {
      return { success: false, error: "Žádný soubor není načten" };
    }

    const defaultOptions: ProcessingOptions = {
      compareNames: true,
      updateTimes: true,
      detectConsecutiveShifts: true,
      timeWindowHours: 3,
      applyChanges: true,
      ...options
    };

    try {
      // 1. Porovnání jmen
      let nameResult = { success: true };
      let nameComparisonReport: string | undefined;
      
      if (defaultOptions.compareNames) {
        const result = await this.processNameComparison({
          applyChanges: defaultOptions.applyChanges
        });
        
        if (!result.success) {
          return result;
        }
        
        nameResult = result;
        nameComparisonReport = result.nameComparisonReport;
      }

      // 2. Detekce navazujících směn a aktualizace časů
      let timeResult = { success: true };
      let timeUpdateReport: string | undefined;
      let consecutiveShiftsReport: string | undefined;
      
      if (defaultOptions.updateTimes) {
        const result = await this.processTimeUpdate({
          detectConsecutiveShifts: defaultOptions.detectConsecutiveShifts,
          timeWindowHours: defaultOptions.timeWindowHours,
          applyChanges: defaultOptions.applyChanges
        });
        
        if (!result.success) {
          return result;
        }
        
        timeResult = result;
        timeUpdateReport = result.timeUpdateReport;
        consecutiveShiftsReport = result.consecutiveShiftsReport;
      }

      return {
        success: true,
        nameComparisonReport,
        timeUpdateReport,
        consecutiveShiftsReport,
        workbook: this.workbook
      };
    } catch (error) {
      logger.error(`Chyba při zpracování souboru: ${error}`);
      return {
        success: false,
        error: `Chyba při zpracování souboru: ${error instanceof Error ? error.message : "Neznámá chyba"}`
      };
    }
  }

  /**
   * Zpracuje porovnání jmen
   */
  async processNameComparison(options?: { applyChanges?: boolean }): Promise<ProcessingResult> {
    if (!this.workbook) {
      return { success: false, error: "Žádný soubor není načten" };
    }

    try {
      // Inicializace služby pro porovnávání jmen
      this.nameComparisonService = new NameComparisonService(this.workbook, {
        list1NameColumn: "B", // Jména v List1 jsou ve sloupci B
        list2NameColumn: "C", // Jména v List2 jsou ve sloupci C
        list1StartRow: 5,     // Data v List1 začínají od řádku 5
        list2StartRow: 6,     // Data v List2 začínají od řádku 6
        similarityThreshold: 2, // Max. 2 odlišné znaky pro "bezpečnou shodu"
        applyChanges: options?.applyChanges !== false,
        maxRows: 100          // Omezení na max. 100 řádků pro prevenci problémů
      });

      // Provedení porovnání
      const nameResults = await this.nameComparisonService.compareAndFixNames();
      
      // Generování reportu
      const nameComparisonReport = this.nameComparisonService.generateReport(nameResults);

      // Pokud máme změny, aktualizujeme workbook
      if (nameResults.workbook) {
        this.workbook = nameResults.workbook;
      }

      return {
        success: true,
        nameComparisonReport,
        workbook: this.workbook
      };
    } catch (error) {
      logger.error(`Chyba při porovnávání jmen: ${error}`);
      return {
        success: false,
        error: `Chyba při porovnávání jmen: ${error instanceof Error ? error.message : "Neznámá chyba"}`
      };
    }
  }

  /**
   * Zpracuje aktualizaci časů
   */
  async processTimeUpdate(options?: { 
    detectConsecutiveShifts?: boolean;
    timeWindowHours?: number;
    applyChanges?: boolean;
  }): Promise<ProcessingResult> {
    if (!this.workbook) {
      return { success: false, error: "Žádný soubor není načten" };
    }

    try {
      // Získání listů
      const list1 = this.workbook.getWorksheet("List1");
      const list2 = this.workbook.getWorksheet("List2");

      if (!list1 || !list2) {
        return {
          success: false,
          error: "Soubor musí obsahovat listy List1 a List2"
        };
      }

      // Extrakce dat pomocí specializovaného extraktoru
      const shifts = extractShiftsFromList1(list1);
      const clockRecords = extractClockRecordsFromList2(list2);

      // Detekce navazujících směn pomocí specialisty
      let consecutiveShifts: { first: ShiftData; second: ShiftData }[] = [];
      let consecutiveShiftsReport = "";

      if (options?.detectConsecutiveShifts !== false) {
        const consecutiveResults = detectConsecutiveShifts(shifts);
        consecutiveShifts = consecutiveResults.consecutiveShifts;
        consecutiveShiftsReport = generateConsecutiveShiftsReport(consecutiveShifts);
      }

      // Aktualizace časů pomocí specializované služby
      const timeUpdateResults = updateShiftTimes(
        shifts,
        clockRecords,
        consecutiveShifts,
        { timeWindowHours: options?.timeWindowHours || 3 }
      );

      // Generování reportu aktualizace časů
      const timeUpdateReport = generateTimeUpdateReport(timeUpdateResults);

      // Aplikace změn do workbooku
      if (options?.applyChanges !== false) {
        updateExcelWorkbook(this.workbook, shifts, consecutiveShifts, timeUpdateResults);
      }

      return {
        success: true,
        timeUpdateReport,
        consecutiveShiftsReport,
        workbook: this.workbook
      };
    } catch (error) {
      logger.error(`Chyba při aktualizaci časů: ${error}`);
      return {
        success: false,
        error: `Chyba při aktualizaci časů: ${error instanceof Error ? error.message : "Neznámá chyba"}`
      };
    }
  }

  /**
   * Získá report bez aplikace změn
   */
  async getReport(): Promise<ProcessingResult> {
    try {
      // Provede zpracování bez aplikace změn
      const nameResult = await this.processNameComparison({ applyChanges: false });
      const timeResult = await this.processTimeUpdate({ 
        detectConsecutiveShifts: true,
        applyChanges: false
      });

      return {
        success: true,
        nameComparisonReport: nameResult.nameComparisonReport,
        timeUpdateReport: timeResult.timeUpdateReport,
        consecutiveShiftsReport: timeResult.consecutiveShiftsReport
      };
    } catch (error) {
      logger.error(`Chyba při generování reportu: ${error}`);
      return {
        success: false,
        error: `Chyba při generování reportu: ${error instanceof Error ? error.message : "Neznámá chyba"}`
      };
    }
  }

  /**
   * Získá výstupní buffer workbooku
   */
  async getOutputBuffer(): Promise<Buffer | null> {
    if (!this.workbook) {
      return null;
    }

    try {
      const buffer = await this.workbook.xlsx.writeBuffer();
      return buffer as unknown as Buffer;
    } catch (error) {
      logger.error(`Chyba při generování bufferu: ${error}`);
      return null;
    }
  }
}