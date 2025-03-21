// modules/podklady/utils/cacheManager.ts

import { StructuredLogger } from "../services/structuredLogger";

const logger = StructuredLogger.getInstance().getComponentLogger("cache-manager");

/**
 * Třída pro správu cache v paměti
 */
export class CacheManager {
  private static _instance: CacheManager;
  private _cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private _defaultTtl: number = 1000 * 60 * 15; // 15 minut v ms
  private _maxItems: number = 100;
  private _cleanupInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    // Naplánování pravidelného čištění
    this._cleanupInterval = setInterval(() => this.cleanup(), 1000 * 60 * 5); // Každých 5 minut
  }
  
  public static getInstance(): CacheManager {
    if (!CacheManager._instance) {
      CacheManager._instance = new CacheManager();
    }
    return CacheManager._instance;
  }
  
  /**
   * Nastaví konfiguraci cache
   * @param options Možnosti konfigurace
   */
  public configure(options: { defaultTtl?: number; maxItems?: number }): void {
    if (options.defaultTtl !== undefined && options.defaultTtl > 0) {
      this._defaultTtl = options.defaultTtl;
    }
    
    if (options.maxItems !== undefined && options.maxItems > 0) {
      this._maxItems = options.maxItems;
    }
    
    logger.info(`Cache nakonfigurována`, { ttl: this._defaultTtl, maxItems: this._maxItems });
  }
  
  /**
   * Uloží data do cache
   * @param key Klíč
   * @param data Data
   * @param ttl Doba platnosti v milisekundách
   */
  public set<T>(key: string, data: T, ttl?: number): void {
    // Pokud máme příliš mnoho položek, smažeme nejstarší
    if (this._cache.size >= this._maxItems) {
      this.removeOldest();
    }
    
    const expiresAt = Date.now() + (ttl || this._defaultTtl);
    this._cache.set(key, { data, expiresAt });
    
    logger.debug(`Cache: nastavena položka`, { 
      key, 
      expiresAt: new Date(expiresAt).toISOString(),
      ttl: ttl || this._defaultTtl,
      cacheSize: this._cache.size 
    });
  }
  
  /**
   * Získá data z cache
   * @param key Klíč
   * @returns Data nebo undefined, pokud položka není v cache nebo vypršela
   */
  public get<T>(key: string): T | undefined {
    const item = this._cache.get(key);
    
    // Pokud položka neexistuje nebo vypršela
    if (!item || item.expiresAt < Date.now()) {
      if (item) {
        // Pokud položka vypršela, odstraníme ji
        this._cache.delete(key);
        logger.debug(`Cache: položka vypršela a byla odstraněna`, { key });
      }
      return undefined;
    }
    
    logger.debug(`Cache: položka nalezena`, { key });
    return item.data as T;
  }
  
  /**
   * Získá data z cache nebo je vytvoří, pokud neexistují
   * @param key Klíč
   * @param factory Funkce pro vytvoření dat
   * @param ttl Doba platnosti v milisekundách
   * @returns Data z cache nebo nově vytvořená data
   */
  public async getOrCreate<T>(
    key: string, 
    factory: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cachedItem = this.get<T>(key);
    
    if (cachedItem !== undefined) {
      logger.debug(`Cache: použita existující položka`, { key });
      return cachedItem;
    }
    
    logger.debug(`Cache: vytvářím novou položku`, { key, ttl });
    
    try {
      const newItem = await factory();
      this.set(key, newItem, ttl);
      logger.debug(`Cache: nová položka vytvořena a uložena`, { key });
      return newItem;
    } catch (error) {
      logger.error(`Cache: chyba při vytváření nové položky`, { key, error });
      throw error;
    }
  }
  
  /**
   * Odstraní položku z cache
   * @param key Klíč
   * @returns true, pokud položka byla odstraněna, jinak false
   */
  public delete(key: string): boolean {
    const result = this._cache.delete(key);
    logger.debug(`Cache: pokus o odstranění položky`, { key, success: result });
    return result;
  }
  
  /**
   * Vyčistí celou cache
   */
  public clear(): void {
    const count = this._cache.size;
    this._cache.clear();
    logger.info('Cache: všechny položky byly odstraněny', { count });
  }
  
 /**
 * Vyčistí vypršelé položky
 * @returns Počet odstraněných položek
 */
public cleanup(): number {
    let removed = 0;
    const now = Date.now();
    const total = this._cache.size;
    
    // Místo iterování přes entries, použijeme forEach
    this._cache.forEach((item, key) => {
      if (item.expiresAt < now) {
        this._cache.delete(key);
        removed++;
      }
    });
    
    if (removed > 0) {
      logger.info(`Cache: odstraněny vypršelé položky`, { 
        removed, 
        total, 
        remaining: total - removed 
      });
    }
    
    return removed;
  }
  
  /**
 * Odstraní nejstarší položku z cache
 * @returns true, pokud položka byla odstraněna, jinak false
 */
private removeOldest(): boolean {
    let oldestKey: string | null = null;
    let oldestExpiry = Infinity;
    
    // Použijeme forEach místo iterátoru
    this._cache.forEach((item, key) => {
      if (item.expiresAt < oldestExpiry) {
        oldestExpiry = item.expiresAt;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      const result = this._cache.delete(oldestKey);
      logger.debug(`Cache: nejstarší položka byla odstraněna`, { 
        key: oldestKey, 
        expiresAt: new Date(oldestExpiry).toISOString(),
        cacheSize: this._cache.size
      });
      return result;
    }
    
    return false;
  }
  
  /**
   * Zruší pravidelné čištění při ukončení
   */
  public dispose(): void {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
      logger.debug('Cache: pravidelné čištění bylo ukončeno');
    }
  }
  
  /**
   * Resetuje instanci pro testování
   */
  public static resetInstance(): void {
    if (CacheManager._instance) {
      const cacheSize = CacheManager._instance._cache.size;
      CacheManager._instance.dispose();
      CacheManager._instance.clear();
      logger.debug('Cache: instance byla resetována', { previousCacheSize: cacheSize });
    }
    CacheManager._instance = new CacheManager();
  }
}