// modules/podklady/config/excelServiceConfig.ts

/**
 * Konfigurace pro služby zpracování Excel souborů
 */
export interface ExcelServiceConfig {
  /**
   * Konfigurace pro porovnávání jmen
   */
  nameComparison: {
    list1NameColumn: string;
    list2NameColumn: string;
    list1StartRow: number;
    list2StartRow: number;
    similarityThreshold: number;
    maxRows: number;
  };
  
  /**
   * Konfigurace pro zpracování časů
   */
  timeProcessing: {
    timeWindowHours: number;
    useConsecutiveShifts: boolean;
  };
  
  /**
   * Konfigurace pro formátování výstupů
   */
  formatting: {
    timeFormat: string;
    cellColorSuccess: string;
    cellColorWarning: string;
    cellColorError: string;
  };
}

/**
 * Výchozí konfigurace
 */
export const defaultConfig: ExcelServiceConfig = {
  nameComparison: {
    list1NameColumn: "B",
    list2NameColumn: "C",
    list1StartRow: 5,
    list2StartRow: 6,
    similarityThreshold: 2,
    maxRows: 100
  },
  timeProcessing: {
    timeWindowHours: 3,
    useConsecutiveShifts: true
  },
  formatting: {
    timeFormat: "h:mm",
    cellColorSuccess: "FFFFFFFF", // Bílá
    cellColorWarning: "FFFFFF00", // Žlutá
    cellColorError: "FFFF0000"   // Červená
  }
};

/**
 * Typy pro validaci konfigurace
 */
export type ConfigValidationResult = {
  isValid: boolean;
  errors: string[];
  validatedConfig: ExcelServiceConfig;
};

export interface NameComparisonConfig {
  list1NameColumn: string;
  list2NameColumn: string;
  list1StartRow: number;
  list2StartRow: number;
  similarityThreshold: number;
  maxRows: number;
}

export interface TimeProcessingConfig {
  timeWindowHours: number;
  useConsecutiveShifts: boolean;
}

export interface FormattingConfig {
  timeFormat: string;
  cellColorSuccess: string;
  cellColorWarning: string;
  cellColorError: string;
}

export interface ExcelServiceConfig {
  /**
   * Konfigurace pro porovnávání jmen
   */
  nameComparison: NameComparisonConfig;
  
  /**
   * Konfigurace pro zpracování časů
   */
  timeProcessing: TimeProcessingConfig;
  
  /**
   * Konfigurace pro formátování výstupů
   */
  formatting: FormattingConfig;
}