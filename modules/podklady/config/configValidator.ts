// modules/podklady/config/configValidator.ts

import { ExcelServiceConfig, defaultConfig, ConfigValidationResult } from "./excelServiceConfig";
import { StructuredLogger } from "../services/structuredLogger";

const logger = StructuredLogger.getInstance().getComponentLogger("config-validator");

/**
 * Validuje konfiguraci a vrací výsledek s případnými chybami
 * @param config Konfigurace k validaci
 * @returns Výsledek validace
 */
export function validateConfig(config: Partial<ExcelServiceConfig>): ConfigValidationResult {
  const errors: string[] = [];
  // Vytvoříme hlubokou kopii defaultConfig
  const validatedConfig: ExcelServiceConfig = JSON.parse(JSON.stringify(defaultConfig));

  logger.info("Validuji konfiguraci", { hasConfig: !!config });

  // Pokud uživatel nepředal konfiguraci, vrátíme výchozí
  if (!config) {
    return { isValid: true, errors: [], validatedConfig };
  }

  try {
    // Validace nameComparison
    if (config.nameComparison) {
      const nc = config.nameComparison;
      
      // Validace list1NameColumn
      if (nc.list1NameColumn !== undefined) {
        if (typeof nc.list1NameColumn === 'string' && /^[A-Z]$/.test(nc.list1NameColumn)) {
          validatedConfig.nameComparison.list1NameColumn = nc.list1NameColumn;
        } else {
          errors.push(`Neplatná hodnota pro list1NameColumn: ${nc.list1NameColumn}. Očekává se jedno velké písmeno (A-Z).`);
        }
      }

      // Validace list2NameColumn
      if (nc.list2NameColumn !== undefined) {
        if (typeof nc.list2NameColumn === 'string' && /^[A-Z]$/.test(nc.list2NameColumn)) {
          validatedConfig.nameComparison.list2NameColumn = nc.list2NameColumn;
        } else {
          errors.push(`Neplatná hodnota pro list2NameColumn: ${nc.list2NameColumn}. Očekává se jedno velké písmeno (A-Z).`);
        }
      }

      // Validace list1StartRow
      if (nc.list1StartRow !== undefined) {
        if (Number.isInteger(nc.list1StartRow) && nc.list1StartRow > 0) {
          validatedConfig.nameComparison.list1StartRow = nc.list1StartRow;
        } else {
          errors.push(`Neplatná hodnota pro list1StartRow: ${nc.list1StartRow}. Očekává se celé číslo větší než 0.`);
        }
      }

      // Validace list2StartRow
      if (nc.list2StartRow !== undefined) {
        if (Number.isInteger(nc.list2StartRow) && nc.list2StartRow > 0) {
          validatedConfig.nameComparison.list2StartRow = nc.list2StartRow;
        } else {
          errors.push(`Neplatná hodnota pro list2StartRow: ${nc.list2StartRow}. Očekává se celé číslo větší než 0.`);
        }
      }

      // Validace similarityThreshold
      if (nc.similarityThreshold !== undefined) {
        if (Number.isInteger(nc.similarityThreshold) && nc.similarityThreshold >= 0) {
          validatedConfig.nameComparison.similarityThreshold = nc.similarityThreshold;
        } else {
          errors.push(`Neplatná hodnota pro similarityThreshold: ${nc.similarityThreshold}. Očekává se celé nezáporné číslo.`);
        }
      }

      // Validace maxRows
      if (nc.maxRows !== undefined) {
        if (Number.isInteger(nc.maxRows) && nc.maxRows > 0) {
          validatedConfig.nameComparison.maxRows = nc.maxRows;
        } else {
          errors.push(`Neplatná hodnota pro maxRows: ${nc.maxRows}. Očekává se celé číslo větší než 0.`);
        }
      }
    }

    // Validace timeProcessing
    if (config.timeProcessing) {
      const tp = config.timeProcessing;
      
      // Validace timeWindowHours
      if (tp.timeWindowHours !== undefined) {
        if (typeof tp.timeWindowHours === 'number' && tp.timeWindowHours > 0) {
          validatedConfig.timeProcessing.timeWindowHours = tp.timeWindowHours;
        } else {
          errors.push(`Neplatná hodnota pro timeWindowHours: ${tp.timeWindowHours}. Očekává se kladné číslo.`);
        }
      }

      // Validace useConsecutiveShifts
      if (tp.useConsecutiveShifts !== undefined) {
        if (typeof tp.useConsecutiveShifts === 'boolean') {
          validatedConfig.timeProcessing.useConsecutiveShifts = tp.useConsecutiveShifts;
        } else {
          errors.push(`Neplatná hodnota pro useConsecutiveShifts: ${tp.useConsecutiveShifts}. Očekává se boolean.`);
        }
      }
    }

    // Validace formatting
    if (config.formatting) {
      const fmt = config.formatting;
      
      // Validace timeFormat
      if (fmt.timeFormat !== undefined) {
        if (typeof fmt.timeFormat === 'string') {
          validatedConfig.formatting.timeFormat = fmt.timeFormat;
        } else {
          errors.push(`Neplatná hodnota pro timeFormat: ${fmt.timeFormat}. Očekává se řetězec.`);
        }
      }

      // Validace barev
      const validateColor = (color: string | undefined, fieldName: string) => {
        if (color !== undefined) {
          if (typeof color === 'string' && /^[A-Fa-f0-9]{8}$/.test(color)) {
            return color;
          } else {
            errors.push(`Neplatná hodnota pro ${fieldName}: ${color}. Očekává se 8místný hexadecimální řetězec (ARGB).`);
            return undefined;
          }
        }
        return undefined;
      };

      const successColor = validateColor(fmt.cellColorSuccess, 'cellColorSuccess');
      if (successColor) validatedConfig.formatting.cellColorSuccess = successColor;

      const warningColor = validateColor(fmt.cellColorWarning, 'cellColorWarning');
      if (warningColor) validatedConfig.formatting.cellColorWarning = warningColor;

      const errorColor = validateColor(fmt.cellColorError, 'cellColorError');
      if (errorColor) validatedConfig.formatting.cellColorError = errorColor;
    }

  } catch (error) {
    logger.error(`Chyba při validaci konfigurace`, { error });
    errors.push(`Neočekávaná chyba při validaci konfigurace: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
  }

  logger.info("Validace konfigurace dokončena", { 
    isValid: errors.length === 0,
    errorsCount: errors.length
  });

  return {
    isValid: errors.length === 0,
    errors,
    validatedConfig
  };
}

/**
 * Načte konfiguraci z proměnných prostředí
 * @returns Částečná konfigurace z env proměnných
 */
export function loadConfigFromEnv(): Partial<ExcelServiceConfig> {
    // Začneme s prázdným objektem
    const partialConfig: Partial<ExcelServiceConfig> = {};
    
    // Mapování env proměnných na konfigurační hodnoty
    const envMapping: { [key: string]: { section: keyof ExcelServiceConfig; property: string; transform?: (value: string) => any } } = {
      EXCEL_LIST1_NAME_COLUMN: { section: 'nameComparison', property: 'list1NameColumn' },
      EXCEL_LIST2_NAME_COLUMN: { section: 'nameComparison', property: 'list2NameColumn' },
      EXCEL_LIST1_START_ROW: { section: 'nameComparison', property: 'list1StartRow', transform: (v) => parseInt(v, 10) },
      EXCEL_LIST2_START_ROW: { section: 'nameComparison', property: 'list2StartRow', transform: (v) => parseInt(v, 10) },
      EXCEL_SIMILARITY_THRESHOLD: { section: 'nameComparison', property: 'similarityThreshold', transform: (v) => parseInt(v, 10) },
      EXCEL_MAX_ROWS: { section: 'nameComparison', property: 'maxRows', transform: (v) => parseInt(v, 10) },
      EXCEL_TIME_WINDOW_HOURS: { section: 'timeProcessing', property: 'timeWindowHours', transform: (v) => parseFloat(v) },
      EXCEL_USE_CONSECUTIVE_SHIFTS: { section: 'timeProcessing', property: 'useConsecutiveShifts', transform: (v) => v.toLowerCase() === 'true' },
      EXCEL_TIME_FORMAT: { section: 'formatting', property: 'timeFormat' },
      EXCEL_COLOR_SUCCESS: { section: 'formatting', property: 'cellColorSuccess' },
      EXCEL_COLOR_WARNING: { section: 'formatting', property: 'cellColorWarning' },
      EXCEL_COLOR_ERROR: { section: 'formatting', property: 'cellColorError' }
    };
  
    logger.info("Načítám konfiguraci z environment proměnných", { 
      availableEnvKeys: Object.keys(envMapping)
    });

    // Připravíme objekty pro shromažďování hodnot
    const nameValues: {[key: string]: any} = {};
    const timeValues: {[key: string]: any} = {};
    const formatValues: {[key: string]: any} = {};
  
    // Načtení hodnot z prostředí
    for (const [envKey, mapping] of Object.entries(envMapping)) {
      const value = process.env[envKey];
      if (value !== undefined) {
        try {
          const transformedValue = mapping.transform ? mapping.transform(value) : value;
          
          // Přidání hodnoty do příslušného dočasného objektu
          if (mapping.section === 'nameComparison') {
            nameValues[mapping.property] = transformedValue;
          } else if (mapping.section === 'timeProcessing') {
            timeValues[mapping.property] = transformedValue;
          } else if (mapping.section === 'formatting') {
            formatValues[mapping.property] = transformedValue;
          }
          
          logger.debug(`Načtena konfigurační hodnota z env`, { 
            envKey, 
            property: mapping.property, 
            section: mapping.section,
            value: transformedValue 
          });
        } catch (error) {
          logger.warn(`Nepodařilo se načíst konfigurační hodnotu z env`, { 
            envKey, 
            error 
          });
        }
      }
    }
  
    // Přidáme do konfigurace pouze neprázdné sekce
    if (Object.keys(nameValues).length > 0) {
      partialConfig.nameComparison = nameValues as any;
    }
    
    if (Object.keys(timeValues).length > 0) {
      partialConfig.timeProcessing = timeValues as any;
    }
    
    if (Object.keys(formatValues).length > 0) {
      partialConfig.formatting = formatValues as any;
    }
  
    logger.info(`Načtena konfigurace z env proměnných`, { 
      config: partialConfig,
      nameValuesCount: Object.keys(nameValues).length,
      timeValuesCount: Object.keys(timeValues).length,
      formatValuesCount: Object.keys(formatValues).length
    });
    
    return partialConfig;
  }

/**
 * Inicializuje konfiguraci z prostředí a aplikuje ji do DI kontejneru
 */
export function initializeConfigFromEnv(): void {
  try {
    logger.info("Zahajuji inicializaci konfigurace z environment proměnných");
    
    const envConfig = loadConfigFromEnv();
    const { isValid, errors, validatedConfig } = validateConfig(envConfig);
    
    if (!isValid) {
      logger.warn(`Konfigurace z env obsahuje chyby`, { 
        errorsCount: errors.length,
        errors 
      });
    }
    
    // Importujeme DependencyContainer, aby nedošlo k cirkulární závislosti
    const { DependencyContainer } = require('../utils/dependencyContainer');
    DependencyContainer.getInstance().setConfig(validatedConfig);
    
    logger.info("Konfigurace z env byla úspěšně načtena a aplikována", {
      isValid,
      hasNameComparisonConfig: !!envConfig.nameComparison,
      hasTimeProcessingConfig: !!envConfig.timeProcessing,
      hasFormattingConfig: !!envConfig.formatting
    });
  } catch (error) {
    logger.error(`Chyba při inicializaci konfigurace z env`, { error });
  }
}