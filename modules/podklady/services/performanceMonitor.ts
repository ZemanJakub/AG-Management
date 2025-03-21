// modules/podklady/services/performanceMonitor.ts

import { StructuredLogger } from "./structuredLogger";
import { v4 as uuidv4 } from 'uuid'; // Budete muset nainstalovat: npm install uuid @types/uuid

const logger = StructuredLogger.getInstance().getComponentLogger("performance-monitor");

/**
 * Rozhraní pro metriky výkonu
 */
export interface PerformanceMetrics {
  id: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
  success?: boolean;
}

/**
 * Třída pro monitorování výkonu operací
 */
export class PerformanceMonitor {
  private static _instance: PerformanceMonitor;
  private _metrics: Map<string, PerformanceMetrics> = new Map();
  private _history: PerformanceMetrics[] = [];
  private _historyLimit: number = 100;
  private _isEnabled: boolean = true;
  
  private constructor() {}
  
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor._instance) {
      PerformanceMonitor._instance = new PerformanceMonitor();
    }
    return PerformanceMonitor._instance;
  }
  
  /**
   * Zapne nebo vypne monitorování výkonu
   * @param enabled true pro zapnutí, false pro vypnutí
   */
  public setEnabled(enabled: boolean): void {
    this._isEnabled = enabled;
    logger.info(`Monitorování výkonu`, { enabled });
  }
  
  /**
   * Zahájí měření výkonu operace
   * @param operation Název operace
   * @param metadata Metadata operace
   * @returns ID měření
   */
  public startMeasurement(operation: string, metadata?: Record<string, any>): string {
    if (!this._isEnabled) return '';
    
    const id = uuidv4();
    const metrics: PerformanceMetrics = {
      id,
      operation,
      startTime: performance.now(),
      metadata
    };
    
    this._metrics.set(id, metrics);
    logger.debug(`Zahájeno měření výkonu`, { operation, id, metadata });
    
    return id;
  }
  
  /**
   * Ukončí měření výkonu operace
   * @param id ID měření
   * @param additionalMetadata Další metadata
   * @param success Zda operace skončila úspěchem
   * @returns Metriky výkonu nebo undefined, pokud měření nebylo nalezeno
   */
  public endMeasurement(
    id: string, 
    additionalMetadata?: Record<string, any>,
    success: boolean = true
  ): PerformanceMetrics | undefined {
    if (!this._isEnabled || !id) return undefined;
    
    const metrics = this._metrics.get(id);
    if (!metrics) {
      logger.warn(`Měření nebylo nalezeno`, { id });
      return undefined;
    }
    
    metrics.endTime = performance.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.success = success;
    
    if (additionalMetadata) {
      metrics.metadata = { ...metrics.metadata, ...additionalMetadata };
    }
    
    // Přidání do historie
    this._history.unshift({ ...metrics });
    if (this._history.length > this._historyLimit) {
      this._history.pop();
    }
    
    // Odstranění z aktivních měření
    this._metrics.delete(id);
    
    logger.info(`Dokončeno měření výkonu`, { 
      operation: metrics.operation, 
      id, 
      duration: metrics.duration.toFixed(2), 
      success,
      metadata: metrics.metadata
    });
    
    return metrics;
  }
  
  /**
   * Získá historii měření
   * @param limit Maximální počet záznamů
   * @returns Pole metrik seřazených od nejnovějších
   */
  public getHistory(limit?: number): PerformanceMetrics[] {
    const actualLimit = limit !== undefined ? limit : this._historyLimit;
    return this._history.slice(0, actualLimit);
  }
  
  /**
   * Vymaže historii měření
   */
  public clearHistory(): void {
    const count = this._history.length;
    this._history = [];
    logger.debug('Historie měření výkonu byla vymazána', { count });
  }
  
  /**
   * Získá statistiky výkonu pro jednotlivé operace
   * @returns Mapa operací a jejich statistiky
   */
  public getStatistics(): Record<string, { 
    count: number; 
    avgDuration: number; 
    minDuration: number; 
    maxDuration: number;
    successRate: number;
  }> {
    const stats: Record<string, { 
      count: number; 
      totalDuration: number; 
      minDuration: number; 
      maxDuration: number;
      successes: number;
    }> = {};
    
    // Agregace metrik
    for (const metrics of this._history) {
      if (!metrics.duration) continue;
      
      if (!stats[metrics.operation]) {
        stats[metrics.operation] = { 
          count: 0, 
          totalDuration: 0, 
          minDuration: Infinity, 
          maxDuration: -Infinity,
          successes: 0
        };
      }
      
      const opStats = stats[metrics.operation];
      opStats.count++;
      opStats.totalDuration += metrics.duration;
      opStats.minDuration = Math.min(opStats.minDuration, metrics.duration);
      opStats.maxDuration = Math.max(opStats.maxDuration, metrics.duration);
      
      if (metrics.success) {
        opStats.successes++;
      }
    }
    
    // Výpočet průměrů a míry úspěšnosti
    const result: Record<string, any> = {};
    for (const [operation, opStats] of Object.entries(stats)) {
      result[operation] = {
        count: opStats.count,
        avgDuration: opStats.count > 0 ? opStats.totalDuration / opStats.count : 0,
        minDuration: opStats.minDuration === Infinity ? 0 : opStats.minDuration,
        maxDuration: opStats.maxDuration === -Infinity ? 0 : opStats.maxDuration,
        successRate: opStats.count > 0 ? (opStats.successes / opStats.count) * 100 : 0
      };
    }
    
    logger.debug("Vygenerovány statistiky výkonu", { 
      operationsCount: Object.keys(result).length, 
      totalMeasurements: this._history.length 
    });
    
    return result;
  }
  
  /**
   * Dekorátor pro měření výkonu metody
   * @param target Cílový objekt
   * @param propertyKey Název metody
   * @param descriptor Deskriptor vlastnosti
   */
  public static measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      if (!monitor._isEnabled) {
        return originalMethod.apply(this, args);
      }
      
      const className = target.constructor.name;
      const methodName = propertyKey;
      const operationName = `${className}.${methodName}`;
      
      const id = monitor.startMeasurement(operationName);
      
      try {
        const result = originalMethod.apply(this, args);
        
        // Pokud je to Promise, počkáme na jeho vyřešení
        if (result instanceof Promise) {
          return result
            .then((value) => {
              monitor.endMeasurement(id, undefined, true);
              return value;
            })
            .catch((error) => {
              monitor.endMeasurement(id, {
                error: error instanceof Error ? error.message : 'Unknown error'
              }, false);
              throw error;
            });
        }
        
        monitor.endMeasurement(id);
        return result;
      } catch (error) {
        monitor.endMeasurement(id, {
          error: error instanceof Error ? error.message : 'Unknown error'
        }, false);
        throw error;
      }
    };
    
    return descriptor;
  }
  
  /**
   * Resetuje instanci pro testování
   */
  public static resetInstance(): void {
    logger.debug("Resetování instance PerformanceMonitor", {
      metricsCount: PerformanceMonitor._instance?._metrics.size || 0,
      historyCount: PerformanceMonitor._instance?._history.length || 0
    });
    PerformanceMonitor._instance = new PerformanceMonitor();
  }
}