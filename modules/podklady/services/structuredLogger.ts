// modules/podklady/services/structuredLogger.ts

import { createLogger as createWinstonLogger, transports, format, Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import 'winston-daily-rotate-file';

/**
 * Rozšířené logování s podporou strukturovaných dat, korelačních ID a ukládání do souborů
 */
export class StructuredLogger {
  private static _instance: StructuredLogger;
  private _logger: Logger;
  private _context: Record<string, any> = {};
  private _correlationId: string | null = null;
  private _logToFile: boolean = false;
  private _logDir: string = '';
  
  private constructor() {
    // Zjistíme, zda běžíme na serveru
    const isServer = typeof window === 'undefined';
    // Zjistíme, zda je povoleno logování do souboru (pomocí proměnné prostředí)
    this._logToFile = isServer && (process.env.LOG_TO_FILE === 'true' || process.env.LOG_TO_FILE === '1');
    
    // Nastavení cesty k logům
    if (isServer) {
      this._logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
      
      // Vytvoření adresáře pro logy, pokud neexistuje
      if (this._logToFile) {
        try {
          if (!fs.existsSync(this._logDir)) {
            fs.mkdirSync(this._logDir, { recursive: true });
          }
        } catch (error) {
          console.error(`Nepodařilo se vytvořit adresář pro logy: ${this._logDir}`, error);
          this._logToFile = false;
        }
      }
    }

    // Základní formát logů
    const baseFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    );

    // Vytvoření transportů
    const logTransports = [
      // Konzolový transport
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
            const correlationStr = correlationId ? `[${correlationId}] ` : '';
            const metaStr = Object.keys(meta).length > 0 ? 
              ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} ${level}: ${correlationStr}${message}${metaStr}`;
          })
        )
      })
    ];

    // Přidáme transport pro soubory, pokud je povoleno logování do souborů
    if (this._logToFile) {
      // Formát názvu souboru: {app}-{date}.log
      const filenamePattern = '%DATE%.log';
      
      // Vytvoření DailyRotateFile transportu pro všechny logy
      const fileTransport = new (transports as any).DailyRotateFile({
        filename: path.join(this._logDir, `app-${filenamePattern}`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m', // Maximální velikost souboru před rotací
        maxFiles: '14d', // Uchovávat logy po dobu 14 dní
        format: baseFormat
      });

      // Přidání transport pro chyby (úroveň error a výše)
      const errorFileTransport = new (transports as any).DailyRotateFile({
        filename: path.join(this._logDir, `error-${filenamePattern}`),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '30d', // Uchovávat chybové logy déle (30 dní)
        format: baseFormat
      });

      // Přidání transportů
      logTransports.push(fileTransport, errorFileTransport);
    }

    // Vytvoření instance Winston loggeru s nakonfigurovanými transporty
    this._logger = createWinstonLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: baseFormat,
      defaultMeta: { service: 'excel-processing' },
      transports: logTransports
    });
  }
  
  public static getInstance(): StructuredLogger {
    if (!StructuredLogger._instance) {
      StructuredLogger._instance = new StructuredLogger();
    }
    return StructuredLogger._instance;
  }
  
  /**
   * Generuje nové korelační ID
   * @returns Vygenerované korelační ID
   */
  public generateCorrelationId(): string {
    this._correlationId = uuidv4();
    return this._correlationId;
  }
  
  /**
   * Nastaví korelační ID
   * @param correlationId Korelační ID
   */
  public setCorrelationId(correlationId: string | null): void {
    this._correlationId = correlationId;
  }
  
  /**
   * Získá aktuální korelační ID
   * @returns Korelační ID nebo null
   */
  public getCorrelationId(): string | null {
    return this._correlationId;
  }
  
  /**
   * Přidá kontext do loggeru
   * @param key Klíč
   * @param value Hodnota
   */
  public addContext(key: string, value: any): void {
    this._context[key] = value;
  }
  
  /**
   * Odstraní kontext z loggeru
   * @param key Klíč
   */
  public removeContext(key: string): void {
    delete this._context[key];
  }
  
  /**
   * Vyčistí celý kontext
   */
  public clearContext(): void {
    this._context = {};
  }
  
  /**
   * Loguje debug zprávu
   * @param message Zpráva
   * @param meta Další metadata
   */
  public debug(message: string, meta?: Record<string, any>): void {
    this._log('debug', message, meta);
  }
  
  /**
   * Loguje informační zprávu
   * @param message Zpráva
   * @param meta Další metadata
   */
  public info(message: string, meta?: Record<string, any>): void {
    this._log('info', message, meta);
  }
  
  /**
   * Loguje varovnou zprávu
   * @param message Zpráva
   * @param meta Další metadata
   */
  public warn(message: string, meta?: Record<string, any>): void {
    this._log('warn', message, meta);
  }
  
  /**
   * Loguje chybovou zprávu
   * @param message Zpráva
   * @param meta Další metadata
   */
  public error(message: string, meta?: Record<string, any>): void {
    this._log('error', message, meta);
  }
  
  /**
   * Interní metoda pro logování
   * @param level Úroveň logu
   * @param message Zpráva
   * @param meta Další metadata
   */
  private _log(level: string, message: string, meta?: Record<string, any>): void {
    const combinedMeta = {
      ...this._context,
      ...(meta || {}),
      ...(this._correlationId ? { correlationId: this._correlationId } : {})
    };
    
    this._logger.log(level, message, combinedMeta);
  }
  
  /**
   * Vytvoří loggeru pro podkomponentu
   * @param component Název komponenty
   * @returns Logger komponenty
   */
  public getComponentLogger(component: string): StructuredLogger {
    const componentLogger = new StructuredLogger();
    componentLogger._logger = this._logger;
    componentLogger._context = { ...this._context, component };
    componentLogger._correlationId = this._correlationId;
    return componentLogger;
  }
  
  /**
   * Kontroluje, zda je povoleno logování do souboru
   * @returns true pokud je logování do souboru povoleno
   */
  public isFileLoggingEnabled(): boolean {
    return this._logToFile;
  }
  
  /**
   * Získá cestu k adresáři s logy
   * @returns Cesta k adresáři s logy
   */
  public getLogDirectory(): string {
    return this._logDir;
  }

  /**
   * Získá seznam všech log souborů
   * @returns Pole s názvy log souborů
   */
  public getLogFiles(): string[] {
    if (!this._logToFile) {
      return [];
    }
    
    try {
      // Kontrola, zda adresář existuje
      if (!fs.existsSync(this._logDir)) {
        return [];
      }
      
      // Získání seznamu souborů
      return fs.readdirSync(this._logDir)
        .filter(file => file.endsWith('.log'))
        .sort((a, b) => {
          // Seřazení podle data vytvoření (nejnovější první)
          const aStats = fs.statSync(path.join(this._logDir, a));
          const bStats = fs.statSync(path.join(this._logDir, b));
          return bStats.mtime.getTime() - aStats.mtime.getTime();
        });
    } catch (error) {
      this.error('Chyba při načítání seznamu logů', { error });
      return [];
    }
  }
  
  /**
   * Načte obsah log souboru
   * @param filename Název log souboru
   * @param maxLines Maximální počet řádků, které se mají načíst (od konce souboru)
   * @returns Obsah log souboru nebo null při chybě
   */
  public getLogFileContent(filename: string, maxLines: number = 1000): string | null {
    if (!this._logToFile) {
      return null;
    }
    
    // Bezpečnostní kontrola názvu souboru
    if (!filename || !filename.endsWith('.log') || filename.includes('..') || filename.includes('/')) {
      this.warn('Neplatný název log souboru', { filename });
      return null;
    }
    
    try {
      const filePath = path.join(this._logDir, filename);
      
      // Kontrola, zda soubor existuje
      if (!fs.existsSync(filePath)) {
        this.warn('Log soubor neexistuje', { filePath });
        return null;
      }
      
      // Načtení obsahu souboru
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Omezení na posledních X řádků
      const lines = content.split('\n');
      const limitedContent = lines.slice(Math.max(0, lines.length - maxLines)).join('\n');
      
      return limitedContent;
    } catch (error) {
      this.error(`Chyba při načítání log souboru`, { filename, error });
      return null;
    }
  }
  
  /**
   * Resetuje instanci pro testování
   */
  public static resetInstance(): void {
    StructuredLogger._instance = new StructuredLogger();
  }
}

// Jednodušší rozhraní pro kompatibilitu se stávajícím kódem
export function createStructuredLogger(component: string): StructuredLogger {
  return StructuredLogger.getInstance().getComponentLogger(component);
}