// modules/podklady/services/excelProcessor.ts
import { ExcelIntegrationService } from "./excelIntegrationService";
import { createLogger } from "./logger";

const logger = createLogger("excel-processor");

/**
 * Třída pro zpracování Excel souborů - nyní jen koordinátor,
 * který deleguje hlavní funkce na ExcelIntegrationService
 */
export class ExcelProcessor {
  private integrationService: ExcelIntegrationService;
  private reportData: {
    nameReport?: string;
    timeReport?: string;
    consecutiveShiftsReport?: string;
  } = {};

  /**
   * Konstruktor inicializuje služby a načte soubor
   * @param excelData Data Excel souboru jako Buffer nebo ArrayBuffer
   */
  constructor(excelData: Buffer | ArrayBuffer) {
    this.integrationService = new ExcelIntegrationService();
    this.initialize(excelData);
  }

  /**
   * Inicializační metoda - načte soubor a připraví reporty
   * @param excelData Data Excel souboru
   */
  private async initialize(excelData: Buffer | ArrayBuffer): Promise<void> {
    try {
      // Načtení souboru do paměti
      const loadSuccess = await this.integrationService.loadFile(excelData);
      
      if (!loadSuccess) {
        logger.error("Nepodařilo se načíst Excel soubor");
        return;
      }
      
      // Připravíme reporty bez provádění změn v souboru
      const reportResult = await this.integrationService.getReport();
      if (reportResult.success) {
        this.reportData.nameReport = reportResult.nameComparisonReport;
        this.reportData.timeReport = reportResult.timeUpdateReport;
        this.reportData.consecutiveShiftsReport = reportResult.consecutiveShiftsReport;
      }
    } catch (error) {
      logger.error(`Chyba při inicializaci: ${error}`);
    }
  }

  /**
   * Konvertuje Buffer na ArrayBuffer
 * @param buffer Buffer k převodu
 * @returns ArrayBuffer
 */
private bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  // Vytvoříme nový ArrayBuffer a zkopírujeme do něj obsah
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
    try {
      const result = await this.integrationService.processAll();
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const buffer = await this.integrationService.getOutputBuffer();
      if (!buffer) {
        throw new Error("Nepodařilo se vygenerovat výstupní buffer");
      }
      
      // Převod Buffer na ArrayBuffer
      return this.bufferToArrayBuffer(buffer);
    } catch (error) {
      logger.error(`Chyba při kompletním zpracování: ${error}`);
      throw error;
    }
  }

  /**
   * Zpracuje pouze porovnání jmen
   * @returns Buffer s výsledným Excel souborem
   */
  public async processNameComparison(): Promise<ArrayBuffer> {
    try {
      const result = await this.integrationService.processNameComparison();
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const buffer = await this.integrationService.getOutputBuffer();
      if (!buffer) {
        throw new Error("Nepodařilo se vygenerovat výstupní buffer");
      }
      
      // Převod Buffer na ArrayBuffer
      return this.bufferToArrayBuffer(buffer);
    } catch (error) {
      logger.error(`Chyba při zpracování porovnání jmen: ${error}`);
      throw error;
    }
  }

  /**
   * Zpracuje pouze aktualizaci časů
   * @returns Buffer s výsledným Excel souborem
   */
  public async processTimeUpdate(): Promise<ArrayBuffer> {
    try {
      const result = await this.integrationService.processTimeUpdate();
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const buffer = await this.integrationService.getOutputBuffer();
      if (!buffer) {
        throw new Error("Nepodařilo se vygenerovat výstupní buffer");
      }
      
      // Převod Buffer na ArrayBuffer
      return this.bufferToArrayBuffer(buffer);
    } catch (error) {
      logger.error(`Chyba při zpracování aktualizace časů: ${error}`);
      throw error;
    }
  }

  /**
   * Získá reporty pro náhled
   * @returns Objekt s HTML reporty
   */
  public getReport(): { nameReport?: string; timeReport?: string } {
    return {
      nameReport: this.reportData.nameReport,
      timeReport: this.reportData.timeReport
    };
  }
}