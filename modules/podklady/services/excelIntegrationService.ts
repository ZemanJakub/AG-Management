// modules/podklady/services/excelIntegrationService.ts
import ExcelJS from "exceljs";
import { StructuredLogger } from "./structuredLogger";
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
import { 
  ExcelProcessingError, 
  FileLoadError, 
  InvalidFormatError,
  NameComparisonError,
  TimeProcessingError,
  OutputGenerationError
} from "./errors";
import { ExcelServiceConfig, defaultConfig } from "../config/excelServiceConfig";
import { IExcelIntegrationService } from '../interfaces/IExcelIntegrationService';

const logger = StructuredLogger.getInstance().getComponentLogger("excel-integration-service");

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

/**
 * Služba pro integraci a koordinaci zpracování Excel souborů
 * Slouží jako fasáda pro ostatní specializované služby
 */
export class ExcelIntegrationService implements IExcelIntegrationService {
  private workbook: ExcelJS.Workbook | null = null;
  private nameComparisonService: NameComparisonService | null = null;

  /**
   * Konstruktor s možností přidat konfiguraci
   * @param config Konfigurace pro zpracování Excel souborů
   */
  constructor(private config: ExcelServiceConfig = defaultConfig) {}

  /**
   * Načte Excel soubor z dat
   * @param data Data Excel souboru
   * @returns true pokud načtení bylo úspěšné
   * @throws FileLoadError pokud se soubor nepodařilo načíst
   * @throws InvalidFormatError pokud soubor nemá správný formát
   */
  async loadFile(data: ArrayBuffer | Buffer): Promise<boolean> {
    try {
      logger.info("Načítám Excel soubor", {
        dataType: data instanceof ArrayBuffer ? "ArrayBuffer" : "Buffer",
        dataSize: data.byteLength
      });
      
      if (data instanceof ArrayBuffer) {
        this.workbook = await loadExcelFromArrayBuffer(data);
      } else {
        this.workbook = await loadExcelFromBuffer(data);
      }
      
      // Ověříme, že soubor má požadovanou strukturu
      this.validateWorkbook();
      
      logger.info("Excel soubor byl úspěšně načten a validován");
      return true;
    } catch (error) {
      if (error instanceof ExcelProcessingError) {
        // Propagujeme již zpracovanou chybu
        throw error;
      }
      
      logger.error(`Chyba při načítání souboru`, { error });
      throw new FileLoadError(`Nepodařilo se načíst Excel soubor: ${error instanceof Error ? error.message : "Neznámá chyba"}`);
    }
  }
  
  /**
   * Ověří strukturu Excel souboru
   * @throws InvalidFormatError pokud soubor nemá správný formát
   */
  private validateWorkbook(): void {
    if (!this.workbook) {
      throw new FileLoadError("Žádný soubor není načten");
    }
    
    const list1 = this.workbook.getWorksheet("List1");
    if (!list1) {
      throw new InvalidFormatError("Soubor musí obsahovat list 'List1'");
    }
    
    const list2 = this.workbook.getWorksheet("List2");
    if (!list2) {
      logger.warn("Soubor neobsahuje list 'List2', bude vytvořen při zpracování");
    }
  }

  /**
   * Provede kompletní zpracování souboru
   * @param options Možnosti zpracování
   * @returns Výsledek zpracování
   */
  async processAll(options?: ProcessingOptions): Promise<ProcessingResult> {
    if (!this.workbook) {
      throw new FileLoadError("Žádný soubor není načten");
    }

    const defaultOptions: ProcessingOptions = {
      compareNames: true,
      updateTimes: true,
      detectConsecutiveShifts: true,
      timeWindowHours: this.config.timeProcessing.timeWindowHours,
      applyChanges: true,
      ...options
    };

    try {
      logger.info(`Spouštím kompletní zpracování`, { options: defaultOptions });
      
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

      logger.info("Kompletní zpracování bylo úspěšně dokončeno", {
        nameComparisonSuccess: nameResult.success,
        timeUpdateSuccess: timeResult.success,
        hasNameReport: !!nameComparisonReport,
        hasTimeReport: !!timeUpdateReport,
        hasConsecutiveReport: !!consecutiveShiftsReport
      });
      
      return {
        success: true,
        nameComparisonReport,
        timeUpdateReport,
        consecutiveShiftsReport,
        workbook: this.workbook
      };
    } catch (error) {
      if (error instanceof ExcelProcessingError) {
        // Propagujeme již zpracovanou chybu
        logger.error(`Chyba při kompletním zpracování`, { 
          errorType: error.name, 
          errorCode: error.code,
          errorMessage: error.message
        });
        return {
          success: false,
          error: error.message
        };
      }
      
      logger.error(`Chyba při kompletním zpracování`, { error });
      return {
        success: false,
        error: `Chyba při zpracování souboru: ${error instanceof Error ? error.message : "Neznámá chyba"}`
      };
    }
  }

  /**
   * Zpracuje porovnání jmen
   * @param options Možnosti zpracování
   * @returns Výsledek zpracování
   */
  async processNameComparison(options?: { applyChanges?: boolean }): Promise<ProcessingResult> {
    if (!this.workbook) {
      throw new FileLoadError("Žádný soubor není načten");
    }

    try {
      logger.info(`Spouštím zpracování porovnání jmen`, { options });
      
      // Inicializace služby pro porovnávání jmen s konfigurací
      this.nameComparisonService = new NameComparisonService(this.workbook, {
        list1NameColumn: this.config.nameComparison.list1NameColumn,
        list2NameColumn: this.config.nameComparison.list2NameColumn,
        list1StartRow: this.config.nameComparison.list1StartRow,
        list2StartRow: this.config.nameComparison.list2StartRow,
        similarityThreshold: this.config.nameComparison.similarityThreshold,
        applyChanges: options?.applyChanges !== false,
        maxRows: this.config.nameComparison.maxRows
      });

      // Provedení porovnání
      const nameResults = await this.nameComparisonService.compareAndFixNames();
      
      logger.info(`Porovnání jmen dokončeno`, {
        totalNames: nameResults.stats.total,
        exactMatches: nameResults.stats.exactMatches,
        safeMatches: nameResults.stats.safeMatches,
        noMatches: nameResults.stats.noMatches,
        changes: nameResults.stats.changes.length
      });
      
      // Generování reportu
      const nameComparisonReport = this.nameComparisonService.generateReport(nameResults);

      // Pokud máme změny, aktualizujeme workbook
      if (nameResults.workbook) {
        this.workbook = nameResults.workbook;
      }

      logger.info("Zpracování porovnání jmen bylo úspěšně dokončeno");
      
      return {
        success: true,
        nameComparisonReport,
        workbook: this.workbook
      };
    } catch (error) {
      if (error instanceof ExcelProcessingError) {
        // Propagujeme již zpracovanou chybu
        logger.error(`Chyba při porovnávání jmen`, {
          errorType: error.name,
          errorCode: error.code,
          errorMessage: error.message
        });
        return {
          success: false,
          error: error.message
        };
      }
      
      logger.error(`Chyba při porovnávání jmen`, { error });
      
      return {
        success: false,
        error: `Chyba při porovnávání jmen: ${error instanceof Error ? error.message : "Neznámá chyba"}`
      };
    }
  }

  /**
   * Zpracuje aktualizaci časů
   * @param options Možnosti zpracování
   * @returns Výsledek zpracování
   */
  async processTimeUpdate(options?: { 
    detectConsecutiveShifts?: boolean;
    timeWindowHours?: number;
    applyChanges?: boolean;
  }): Promise<ProcessingResult> {
    if (!this.workbook) {
      throw new FileLoadError("Žádný soubor není načten");
    }

    try {
      logger.info(`Spouštím zpracování aktualizace časů`, { options });
      
      // Získání listů
      const list1 = this.workbook.getWorksheet("List1");
      const list2 = this.workbook.getWorksheet("List2");

      if (!list1 || !list2) {
        throw new InvalidFormatError("Soubor musí obsahovat listy List1 a List2");
      }

      // Extrakce dat pomocí specializovaného extraktoru
      const shifts = extractShiftsFromList1(list1);
      const clockRecords = extractClockRecordsFromList2(list2);

      logger.info(`Extrahováno dat`, {
        shiftsCount: shifts.length,
        clockRecordsCount: clockRecords.length
      });

      // Detekce navazujících směn pomocí specialisty
      let consecutiveShifts: { first: ShiftData; second: ShiftData }[] = [];
      let consecutiveShiftsReport = "";

      if (options?.detectConsecutiveShifts !== false) {
        logger.info("Spouštím detekci navazujících směn");
        const consecutiveResults = detectConsecutiveShifts(shifts);
        consecutiveShifts = consecutiveResults.consecutiveShifts;
        consecutiveShiftsReport = generateConsecutiveShiftsReport(consecutiveShifts);
        logger.info(`Detekce navazujících směn dokončena`, {
          consecutivePairsCount: consecutiveShifts.length,
          shiftsWithConsecutive: consecutiveResults.shiftsWithConsecutive
        });
      }

      // Aktualizace časů pomocí specializované služby
      const timeUpdateResults = updateShiftTimes(
        shifts,
        clockRecords,
        consecutiveShifts,
        { timeWindowHours: options?.timeWindowHours || this.config.timeProcessing.timeWindowHours }
      );

      logger.info(`Aktualizace časů dokončena`, {
        updatedShifts: timeUpdateResults.updatedShifts,
        entriesFound: timeUpdateResults.entriesFound,
        exitsFound: timeUpdateResults.exitsFound,
        usedRowsStartCount: timeUpdateResults.usedRowsStart.size,
        usedRowsEndCount: timeUpdateResults.usedRowsEnd.size
      });

      // Generování reportu aktualizace časů
      const timeUpdateReport = generateTimeUpdateReport(timeUpdateResults);

      // Aplikace změn do workbooku
      if (options?.applyChanges !== false) {
        updateExcelWorkbook(this.workbook, shifts, consecutiveShifts, timeUpdateResults);
        logger.info("Změny časů byly aplikovány do workbooku");
      }

      logger.info(`Zpracování aktualizace časů bylo úspěšně dokončeno`);

      return {
        success: true,
        timeUpdateReport,
        consecutiveShiftsReport,
        workbook: this.workbook
      };
    } catch (error) {
      if (error instanceof ExcelProcessingError) {
        // Propagujeme již zpracovanou chybu
        logger.error(`Chyba při aktualizaci časů`, {
          errorType: error.name,
          errorCode: error.code,
          errorMessage: error.message
        });
        return {
          success: false,
          error: error.message
        };
      }
      
      logger.error(`Chyba při aktualizaci časů`, { error });
      
      return {
        success: false,
        error: `Chyba při aktualizaci časů: ${error instanceof Error ? error.message : "Neznámá chyba"}`
      };
    }
  }

  /**
   * Získá report bez aplikace změn
   * @returns Výsledek zpracování s reporty
   */
  async getReport(): Promise<ProcessingResult> {
    try {
      logger.info("Generuji reporty bez aplikace změn");
      
      // Provede zpracování bez aplikace změn
      const nameResult = await this.processNameComparison({ applyChanges: false });
      const timeResult = await this.processTimeUpdate({ 
        detectConsecutiveShifts: true,
        applyChanges: false
      });

      logger.info("Reporty byly úspěšně vygenerovány", {
        nameReportSuccess: nameResult.success,
        timeReportSuccess: timeResult.success,
        hasNameReport: !!nameResult.nameComparisonReport,
        hasTimeReport: !!timeResult.timeUpdateReport,
        hasConsecutiveReport: !!timeResult.consecutiveShiftsReport
      });
      
      return {
        success: true,
        nameComparisonReport: nameResult.nameComparisonReport,
        timeUpdateReport: timeResult.timeUpdateReport,
        consecutiveShiftsReport: timeResult.consecutiveShiftsReport
      };
    } catch (error) {
      if (error instanceof ExcelProcessingError) {
        // Propagujeme již zpracovanou chybu
        logger.error(`Chyba při generování reportů`, {
          errorType: error.name,
          errorCode: error.code,
          errorMessage: error.message
        });
        return {
          success: false,
          error: error.message
        };
      }
      
      logger.error(`Chyba při generování reportů`, { error });
      
      return {
        success: false,
        error: `Chyba při generování reportů: ${error instanceof Error ? error.message : "Neznámá chyba"}`
      };
    }
  }

  /**
   * Získá výstupní buffer workbooku
   * @returns Buffer s Excel souborem nebo null při chybě
   * @throws OutputGenerationError pokud se buffer nepodařilo vygenerovat
   */
  async getOutputBuffer(): Promise<Buffer | null> {
    if (!this.workbook) {
      throw new FileLoadError("Žádný soubor není načten");
    }

    try {
      logger.info("Generuji výstupní buffer");
      const buffer = await this.workbook.xlsx.writeBuffer();
      logger.info("Výstupní buffer byl úspěšně vygenerován", {
        bufferSize: buffer.byteLength
      });
      return buffer as unknown as Buffer;
    } catch (error) {
      logger.error(`Chyba při generování bufferu`, { error });
      throw new OutputGenerationError(`Nepodařilo se vygenerovat výstupní buffer: ${error instanceof Error ? error.message : "Neznámá chyba"}`);
    }
  }
}