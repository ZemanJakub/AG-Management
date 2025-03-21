// modules/podklady/utils/dependencyContainer.ts

import { IExcelIntegrationService } from "../interfaces/IExcelIntegrationService";
import { INameComparisonService } from "../interfaces/INameComparisonService";
import { ExcelIntegrationService } from "../services/excelIntegrationService";
import { NameComparisonService } from "../services/nameComparisonService";
import { ExcelServiceConfig, defaultConfig } from "../config/excelServiceConfig";
import { StructuredLogger } from "../services/structuredLogger";
import ExcelJS from "exceljs";

const logger = StructuredLogger.getInstance().getComponentLogger("dependency-container");

type ServiceType = 
  | "IExcelIntegrationService" 
  | "INameComparisonService";

export class DependencyContainer {
  private static _instance: DependencyContainer;
  private _services: Map<string, any> = new Map();
  private _config: ExcelServiceConfig = { ...defaultConfig };
  private _mocks: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer._instance) {
      DependencyContainer._instance = new DependencyContainer();
    }
    return DependencyContainer._instance;
  }

  public getConfig(): ExcelServiceConfig {
    return { ...this._config }; // Vracíme kopii pro zamezení přímé modifikace
  }

  public setConfig(config: Partial<ExcelServiceConfig>): void {
    this._config = { 
      ...this._config,
      ...(config.nameComparison ? { nameComparison: { ...this._config.nameComparison, ...config.nameComparison } } : {}),
      ...(config.timeProcessing ? { timeProcessing: { ...this._config.timeProcessing, ...config.timeProcessing } } : {}),
      ...(config.formatting ? { formatting: { ...this._config.formatting, ...config.formatting } } : {})
    };
    
    logger.info(`Konfigurace aktualizována`, { config: this._config });
    
    // Resetujeme služby, aby se vytvořily s novou konfigurací
    this._services.clear();
  }

  public getService<T>(serviceType: ServiceType): T {
    // Nejprve zkontrolujeme, zda existuje mock
    if (this._mocks.has(serviceType)) {
      return this._mocks.get(serviceType) as T;
    }
    
    // Pokud ne, vrátíme nebo vytvoříme skutečnou službu
    if (!this._services.has(serviceType)) {
      this._services.set(serviceType, this.createService(serviceType));
    }
    return this._services.get(serviceType) as T;
  }

  public registerMock<T>(serviceType: ServiceType, instance: T): void {
    this._mocks.set(serviceType, instance);
    logger.debug(`Mock registrován pro službu`, { serviceType });
  }

  public clearMocks(): void {
    this._mocks.clear();
    logger.debug("Všechny mocky byly vyčištěny");
  }

  private createService(serviceType: ServiceType): any {
    logger.debug(`Vytvářím novou instanci služby`, { serviceType });
    
    switch (serviceType) {
      case "IExcelIntegrationService":
        return new ExcelIntegrationService(this._config);
      case "INameComparisonService":
        // Pro NameComparisonService potřebujeme nějaký workbook, 
        // ale ten se běžně poskytuje při volání loadFromBuffer
        const config = {
          list1NameColumn: this._config.nameComparison.list1NameColumn,
          list2NameColumn: this._config.nameComparison.list2NameColumn,
          list1StartRow: this._config.nameComparison.list1StartRow,
          list2StartRow: this._config.nameComparison.list2StartRow,
          similarityThreshold: this._config.nameComparison.similarityThreshold,
          applyChanges: true,
          maxRows: this._config.nameComparison.maxRows
        };
        
        logger.debug(`Vytvářím NameComparisonService s konfigurací`, { config });
        return new NameComparisonService(new ExcelJS.Workbook(), config);
      default:
        const errorMsg = `Neznámý typ služby: ${serviceType}`;
        logger.error(`Chyba při vytváření služby`, { serviceType, error: errorMsg });
        throw new Error(errorMsg);
    }
  }

  // Pro testování - vyčistit všechny služby
  public clearServices(): void {
    const serviceCount = this._services.size;
    this._services.clear();
    logger.debug("Všechny služby byly vyčištěny", { serviceCount });
  }

  // Pro testování - resetovat instanci a vše vyčistit
  public static resetInstance(): void {
    if (DependencyContainer._instance) {
      const servicesCount = DependencyContainer._instance._services.size;
      const mocksCount = DependencyContainer._instance._mocks.size;
      
      DependencyContainer._instance.clearServices();
      DependencyContainer._instance.clearMocks();
      
      logger.debug("Instance DependencyContainer byla resetována", { 
        previousServices: servicesCount, 
        previousMocks: mocksCount 
      });
    } else {
      logger.debug("Vytvářím novou instanci DependencyContainer");
    }
    DependencyContainer._instance = new DependencyContainer();
  }
}