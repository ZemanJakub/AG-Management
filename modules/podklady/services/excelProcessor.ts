// modules/podklady/services/excelProcessor.ts

import { IExcelIntegrationService } from "../interfaces/IExcelIntegrationService";
import { DependencyContainer } from "../utils/dependencyContainer";
import { PerformanceMonitor } from "./performanceMonitor";
import { StructuredLogger } from "./structuredLogger";
import { CacheManager } from "../utils/cacheManager";
import { v4 as uuidv4 } from 'uuid';

export class ExcelProcessor {
  private integrationService: IExcelIntegrationService;
  private reportData: {
    nameReport?: string;
    timeReport?: string;
    consecutiveShiftsReport?: string;
  } = {};
  private logger: StructuredLogger;
  private performanceMonitor: PerformanceMonitor;
  private cache: CacheManager;
  private correlationId: string;

  /**
   * Factory metoda pro vytvoření instance
   * @param excelData Data Excel souboru
   * @returns Instance ExcelProcessor
   */
  public static async create(excelData: Buffer | ArrayBuffer): Promise<ExcelProcessor> {
    const processor = new ExcelProcessor();
    await processor.initialize(excelData);
    return processor;
  }

  private constructor() {
    // Získání služeb z DI kontejneru
    this.integrationService = DependencyContainer.getInstance().getService<IExcelIntegrationService>("IExcelIntegrationService");
    this.logger = StructuredLogger.getInstance().getComponentLogger('ExcelProcessor');
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.cache = CacheManager.getInstance();
    
    // Generování korelačního ID pro sledování operací
    this.correlationId = uuidv4();
    this.logger.setCorrelationId(this.correlationId);
    
    this.logger.info('ExcelProcessor inicializován');
  }

  /**
   * Inicializační metoda - načte soubor a připraví reporty
   * @param excelData Data Excel souboru
   */
  private async initialize(excelData: Buffer | ArrayBuffer): Promise<void> {
    const measurementId = this.performanceMonitor.startMeasurement('ExcelProcessor.initialize', {
      dataType: excelData instanceof Buffer ? 'Buffer' : 'ArrayBuffer',
      size: excelData instanceof Buffer ? excelData.length : excelData.byteLength
    });
    
    try {
      this.logger.info('Začínám inicializaci a načítání souboru');
      
      // Načtení souboru do paměti
      const loadSuccess = await this.integrationService.loadFile(excelData);
      
      if (!loadSuccess) {
        this.logger.error("Nepodařilo se načíst Excel soubor");
        throw new Error("Nepodařilo se načíst Excel soubor");
      }
      
      this.logger.info('Soubor úspěšně načten, generuji reporty');
      
      // Připravíme reporty bez provádění změn v souboru
      const reportResult = await this.integrationService.getReport();
      if (reportResult.success) {
        this.reportData.nameReport = reportResult.nameComparisonReport;
        this.reportData.timeReport = reportResult.timeUpdateReport;
        this.reportData.consecutiveShiftsReport = reportResult.consecutiveShiftsReport;
        
        this.logger.info('Reporty úspěšně vygenerovány', {
          hasNameReport: !!this.reportData.nameReport,
          hasTimeReport: !!this.reportData.timeReport,
          hasConsecutiveShiftsReport: !!this.reportData.consecutiveShiftsReport
        });
      } else {
        this.logger.warn('Nepodařilo se vygenerovat reporty', { error: reportResult.error });
      }
      
      this.performanceMonitor.endMeasurement(measurementId, {
        success: true,
        reportsGenerated: reportResult.success
      });
    } catch (error) {
      this.logger.error(`Chyba při inicializaci: ${error}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      this.performanceMonitor.endMeasurement(measurementId, {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, false);
      
      throw error;
    }
  }

  /**
   * Konvertuje Buffer na ArrayBuffer
   * @param buffer Buffer k převodu
   * @returns ArrayBuffer
   */
  private bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
  }

  /**
   * Provede kompletní zpracování souboru
   * @returns Buffer s výsledným Excel souborem
   */
  public async processAll(): Promise<ArrayBuffer> {
    const measurementId = this.performanceMonitor.startMeasurement('ExcelProcessor.processAll');
    
    try {
      this.logger.info('Zahájení kompletního zpracování');
      
      // Použití cache pro optimalizaci
      const cacheKey = `excelProcess:${this.correlationId}`;
      
      const result = await this.cache.getOrCreate<ArrayBuffer>(cacheKey, async () => {
        const result = await this.integrationService.processAll();
        if (!result.success) {
          throw new Error(result.error || "Neznámá chyba při zpracování");
        }
        
        const buffer = await this.integrationService.getOutputBuffer();
        if (!buffer) {
          throw new Error("Nepodařilo se vygenerovat výstupní buffer");
        }
        
        // Převod Buffer na ArrayBuffer
        return this.bufferToArrayBuffer(buffer);
      }, 1000 * 60 * 5); // Cache na 5 minut
      
      this.performanceMonitor.endMeasurement(measurementId, { success: true });
      return result;
    } catch (error) {
      this.logger.error(`Chyba při kompletním zpracování: ${error}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      this.performanceMonitor.endMeasurement(measurementId, {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, false);
      
      throw error;
    }
  }

  /**
   * Zpracuje pouze porovnání jmen
   * @returns Buffer s výsledným Excel souborem
   */
  public async processNameComparison(): Promise<ArrayBuffer> {
    const measurementId = this.performanceMonitor.startMeasurement('ExcelProcessor.processNameComparison');
    
    try {
      this.logger.info('Zahájení zpracování porovnání jmen');
      
      const result = await this.integrationService.processNameComparison();
      if (!result.success) {
        throw new Error(result.error || "Neznámá chyba při porovnávání jmen");
      }
      
      const buffer = await this.integrationService.getOutputBuffer();
      if (!buffer) {
        throw new Error("Nepodařilo se vygenerovat výstupní buffer");
      }
      
      // Aktualizace reportu
      if (result.nameComparisonReport) {
        this.reportData.nameReport = result.nameComparisonReport;
      }
      
      this.performanceMonitor.endMeasurement(measurementId, { success: true });
      
      // Převod Buffer na ArrayBuffer
      return this.bufferToArrayBuffer(buffer);
    } catch (error) {
      this.logger.error(`Chyba při zpracování porovnání jmen: ${error}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      this.performanceMonitor.endMeasurement(measurementId, {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, false);
      
      throw error;
    }
  }

  /**
   * Zpracuje pouze aktualizaci časů
   * @returns Buffer s výsledným Excel souborem
   */
  public async processTimeUpdate(): Promise<ArrayBuffer> {
    const measurementId = this.performanceMonitor.startMeasurement('ExcelProcessor.processTimeUpdate');
    
    try {
      this.logger.info('Zahájení zpracování aktualizace časů');
      
      const result = await this.integrationService.processTimeUpdate({
        detectConsecutiveShifts: true
      });
      if (!result.success) {
        throw new Error(result.error || "Neznámá chyba při aktualizaci časů");
      }
      
      const buffer = await this.integrationService.getOutputBuffer();
      if (!buffer) {
        throw new Error("Nepodařilo se vygenerovat výstupní buffer");
      }
      
      // Aktualizace reportů
      if (result.timeUpdateReport) {
        this.reportData.timeReport = result.timeUpdateReport;
      }
      if (result.consecutiveShiftsReport) {
        this.reportData.consecutiveShiftsReport = result.consecutiveShiftsReport;
      }
      
      this.performanceMonitor.endMeasurement(measurementId, { success: true });
      
      // Převod Buffer na ArrayBuffer
      return this.bufferToArrayBuffer(buffer);
    } catch (error) {
      this.logger.error(`Chyba při zpracování aktualizace časů: ${error}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      this.performanceMonitor.endMeasurement(measurementId, {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, false);
      
      throw error;
    }
  }

  /**
   * Získá reporty pro náhled
   * @returns Objekt s HTML reporty
   */
  public getReport(): { nameReport?: string; timeReport?: string; consecutiveShiftsReport?: string } {
    return { ...this.reportData };
  }
  
  /**
   * Zruší všechny prostředky
   */
  public dispose(): void {
    this.logger.info('Uvolňuji prostředky ExcelProcessor');
    // Zde můžeme přidat další kód pro uvolnění prostředků, pokud to bude potřeba
  }
}