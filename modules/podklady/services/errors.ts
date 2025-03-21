// modules/podklady/services/errors.ts
/**
 * Základní třída pro chyby při zpracování Excel souborů
 */
export class ExcelProcessingError extends Error {
    constructor(message: string, public readonly code: string) {
      super(message);
      this.name = 'ExcelProcessingError';
    }
  }
  
  /**
   * Chyba při načítání souboru
   */
  export class FileLoadError extends ExcelProcessingError {
    constructor(message: string) {
      super(message, 'FILE_LOAD_ERROR');
      this.name = 'FileLoadError';
    }
  }
  
  /**
   * Chyba při neplatném formátu souboru
   */
  export class InvalidFormatError extends ExcelProcessingError {
    constructor(message: string) {
      super(message, 'INVALID_FORMAT');
      this.name = 'InvalidFormatError';
    }
  }
  
  /**
   * Chyba při zpracování porovnání jmen
   */
  export class NameComparisonError extends ExcelProcessingError {
    constructor(message: string) {
      super(message, 'NAME_COMPARISON_ERROR');
      this.name = 'NameComparisonError';
    }
  }
  
  /**
   * Chyba při zpracování časů
   */
  export class TimeProcessingError extends ExcelProcessingError {
    constructor(message: string) {
      super(message, 'TIME_PROCESSING_ERROR');
      this.name = 'TimeProcessingError';
    }
  }
  
  /**
   * Chyba při generování výstupu
   */
  export class OutputGenerationError extends ExcelProcessingError {
    constructor(message: string) {
      super(message, 'OUTPUT_GENERATION_ERROR');
      this.name = 'OutputGenerationError';
    }
  }