// modules/podklady/services/nameComparisonService.ts
import ExcelJS from "exceljs";

import { StructuredLogger } from "./structuredLogger";
import { levenshtein } from "../utils/textUtils";

const logger = StructuredLogger.getInstance().getComponentLogger("name-comparison-service");

/**
 * Typy pro výsledky porovnání jmen
 */
export interface NameComparisonResult {
  nameUpdated: boolean;
  originalName: string;
  newName: string;
  matchType: 'exact' | 'safe' | 'none';
  rowIndex: number;
  score?: number;
}

/**
 * Typy pro statistiky porovnání jmen
 */
export interface NameComparisonStats {
  total: number;
  exactMatches: number;
  safeMatches: number;
  noMatches: number;
  changes: NameComparisonResult[];
}

/**
 * Typy pro návratovou hodnotu z porovnání jmen
 */
export interface NameComparisonOutput {
  results: NameComparisonResult[];
  stats: NameComparisonStats;
  workbook?: ExcelJS.Workbook; // Výsledný workbook po aplikaci změn
}

/**
 * Nastavení pro porovnávání jmen
 */
export interface NameComparisonOptions {
  list1NameColumn: string;   // Sloupec s jmény v List1 (např. 'B')
  list2NameColumn: string;   // Sloupec s jmény v List2 (např. 'C')
  list1StartRow: number;     // První řádek s daty v List1 (např. 5)
  list2StartRow: number;     // První řádek s daty v List2 (např. 6)
  similarityThreshold: number; // Práh podobnosti pro "bezpečnou shodu" (např. 2)
  applyChanges: boolean;     // Zda aplikovat změny do workbooku
  maxRows: number;           // Maximální počet řádků k zpracování
}

/**
 * Třída pro porovnávání a korekci jmen mezi listy List1 a List2
 */
export class NameComparisonService {
  private workbook: ExcelJS.Workbook;
  private options: NameComparisonOptions;

  /**
   * Konstruktor - přijímá buď Buffer/ArrayBuffer nebo přímo ExcelJS.Workbook
   * @param excelData Excel data (Buffer, ArrayBuffer nebo Workbook)
   * @param options Nastavení pro porovnávání jmen
   */
  constructor(
    excelData: Buffer | ArrayBuffer | ExcelJS.Workbook,
    options?: Partial<NameComparisonOptions>
  ) {
    // Výchozí nastavení
    this.options = {
      list1NameColumn: 'B', // Jména v List1 jsou ve sloupci B
      list2NameColumn: 'C',
      list1StartRow: 5,
      list2StartRow: 6,
      similarityThreshold: 2,
      applyChanges: true,
      maxRows: 100, // Omezení počtu řádků pro prevenci zpracování celého souboru
      ...options
    };

    // Inicializace workbooku
    if (excelData instanceof ExcelJS.Workbook) {
      // Použití již existujícího workbooku
      this.workbook = excelData;
    } else {
      // Vytvoření nového workbooku
      this.workbook = new ExcelJS.Workbook();
      // Načtení dat bude asynchronní a musí se provést zvlášť
    }
  }

  /**
   * Asynchronní inicializace z buffer dat
   * @param buffer Buffer nebo ArrayBuffer s Excel daty
   */
  public async loadFromBuffer(buffer: Buffer | ArrayBuffer): Promise<void> {
    try {
      // Použijeme typové přetypování k obejití typových omezení
      if (buffer instanceof ArrayBuffer) {
        // Pro ArrayBuffer musíme nejprve vytvořit Uint8Array a pak Buffer
        const data = new Uint8Array(buffer);
        // Použijeme any, abychom obešli typovou kontrolu
        await this.workbook.xlsx.load(Buffer.from(data) as any);
      } else {
        // Pro existující Buffer také použijeme any
        await this.workbook.xlsx.load(buffer as any);
      }
      
      // Kontrola existence listů
      const list1 = this.workbook.getWorksheet('List1');
      const list2 = this.workbook.getWorksheet('List2');
      
      if (!list1) {
        throw new Error('Excel soubor musí obsahovat list "List1"');
      }
      
      if (!list2) {
        throw new Error('Excel soubor musí obsahovat list "List2"');
      }
      
      logger.info('Workbook úspěšně načten z bufferu', {
        list1RowCount: list1.rowCount,
        list2RowCount: list2.rowCount,
        options: this.options
      });
    } catch (error) {
      logger.error(`Chyba při načítání workbooku z bufferu`, { error });
      throw error;
    }
  }

  /**
   * Odstraní diakritiku z textu
   */
  private removeDiacritics(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Normalizace jména -- odstraňuje přebytečné mezery, převádí text na malá písmena a odstraňuje diakritiku
   * @param name Vstupní jméno
   * @returns Normalizované jméno
   */
  private normalizeName(name: string): string {
    if (!name) return '';
    
    let normalizedName = String(name).trim().toLowerCase();
    
    // Náhrada více mezer za jednu
    while (normalizedName.includes('  ')) {
      normalizedName = normalizedName.replace('  ', ' ');
    }
    
    // Odstranění diakritiky
    normalizedName = this.removeDiacritics(normalizedName);
    
    return normalizedName;
  }

  /**
   * Porovnání jmen s váhováním a rozdělením na části
   * @param name1 První jméno
   * @param name2 Druhé jméno
   * @returns Skóre podobnosti a informace o typu shody
   */
  private compareNames(name1: string, name2: string): {
    score: number;
    exactMatch: boolean;
    safeMatch: boolean;
  } {
    // Normalizace jmen pro porovnání
    const normalized1 = this.normalizeName(name1);
    const normalized2 = this.normalizeName(name2);
    
    // Kontrola absolutní shody
    if (normalized1 === normalized2) {
      return { score: 100, exactMatch: true, safeMatch: true };
    }
    
    // Rozdělení na části (příjmení je první část)
    const parts1 = normalized1.split(' ');
    const parts2 = normalized2.split(' ');
    
    // Kontrola prázdných jmen
    if (parts1.length === 0 || parts2.length === 0) {
      return { score: 0, exactMatch: false, safeMatch: false };
    }
    
    // Extrahování příjmení (první část)
    const surname1 = parts1[0];
    const surname2 = parts2[0];
    
    // Vylepšená kontrola shody příjmení - porovnává také začátek příjmení
    // Toto pomůže se zkrácenými formami jako "Durich" vs "Duricha"
    const minSurnameLength = Math.min(surname1.length, surname2.length);
    const commonPrefixLength = 4; // Minimálně 4 znaky musí být stejné
    
    // Kontrola, zda jedno příjmení začíná druhým
    if (minSurnameLength >= commonPrefixLength && 
        (surname1.startsWith(surname2) || surname2.startsWith(surname1))) {
      // Možná zkrácená forma příjmení
      
      // Případ, kdy jedno nebo obě jména obsahují jen příjmení
      if (parts1.length === 1 || parts2.length === 1) {
        if (parts1.length === 1 && parts2.length === 1) {
          // Obě jména obsahují jen příjmení, která se částečně shodují
          return { score: 85, exactMatch: false, safeMatch: true };
        }
        
        // Jedno jméno má jen příjmení, druhé má i křestní jméno
        return { score: 65, exactMatch: false, safeMatch: true };
      }
      
      // Obě jména mají příjmení i křestní jméno
      // Porovnání křestních jmen (vše kromě prvního elementu, který je příjmení)
      const givenName1 = parts1.slice(1).join(' ');
      const givenName2 = parts2.slice(1).join(' ');
      
      const distance = levenshtein(givenName1, givenName2);
      
      // Bezpečná shoda, pokud je vzdálenost menší nebo rovna prahu
      const isSafeMatch = distance <= this.options.similarityThreshold;
      
      // Skóre na základě vzdálenosti (100 pro přesnou shodu, méně pro podobné)
      const score = isSafeMatch ? 90 - (distance * 10) : 0;
      
      return {
        score,
        exactMatch: false,
        safeMatch: isSafeMatch
      };
    }
    
    // Původní kontrola přesné shody příjmení
    if (surname1 !== surname2) {
      // Dodatečná kontrola podobnosti příjmení
      const surnameDistance = levenshtein(surname1, surname2);
      
      // Pokud jsou příjmení velmi podobná (maximálně 2 znaky rozdíl)
      if (surnameDistance <= 2) {
        // Podobná příjmení - dále kontrolujeme křestní jména
        if (parts1.length === 1 || parts2.length === 1) {
          return { score: 60, exactMatch: false, safeMatch: true };
        }
        
        // Obě jména mají i křestní jméno
        const givenName1 = parts1.slice(1).join(' ');
        const givenName2 = parts2.slice(1).join(' ');
        
        const distance = levenshtein(givenName1, givenName2);
        const isSafeMatch = distance <= this.options.similarityThreshold;
        
        // Nižší skóre kvůli rozdílům v příjmení
        const score = isSafeMatch ? 80 - (distance * 10) - (surnameDistance * 5) : 0;
        
        return {
          score,
          exactMatch: false,
          safeMatch: isSafeMatch
        };
      }
      
      return { score: 0, exactMatch: false, safeMatch: false };
    }
    
    // Případ, kdy jedno nebo obě jména obsahují jen příjmení
    if (parts1.length === 1 || parts2.length === 1) {
      if (parts1.length === 1 && parts2.length === 1) {
        // Obě jména obsahují jen příjmení, která se shodují
        return { score: 90, exactMatch: false, safeMatch: true };
      }
      
      // Jedno jméno má jen příjmení, druhé má i křestní jméno
      return { score: 70, exactMatch: false, safeMatch: true };
    }
    
    // Obě jména mají příjmení i křestní jméno
    // Porovnání křestních jmen (vše kromě prvního elementu, který je příjmení)
    const givenName1 = parts1.slice(1).join(' ');
    const givenName2 = parts2.slice(1).join(' ');
    
    const distance = levenshtein(givenName1, givenName2);
    
    // Bezpečná shoda, pokud je vzdálenost menší nebo rovna prahu
    const isSafeMatch = distance <= this.options.similarityThreshold;
    
    // Skóre na základě vzdálenosti (100 pro přesnou shodu, méně pro podobné)
    const score = isSafeMatch ? 100 - (distance * 10) : 0;
    
    return {
      score,
      exactMatch: false,
      safeMatch: isSafeMatch
    };
  }

  /**
   * Provedení porovnání jmen
   * @returns Výsledky porovnání
   */
  public async compareAndFixNames(): Promise<NameComparisonOutput> {
    try {
      logger.info('Spouštím porovnání a korekci jmen', { 
        applyChanges: this.options.applyChanges,
        similarityThreshold: this.options.similarityThreshold,
        maxRows: this.options.maxRows
      });
      
      // Získání listů
      const list1 = this.workbook.getWorksheet('List1');
      const list2 = this.workbook.getWorksheet('List2');
      
      if (!list1 || !list2) {
        const error = 'Některý z požadovaných listů (List1 nebo List2) neexistuje';
        logger.error(error);
        throw new Error(error);
      }
      
      // Dekódování indexů sloupců
      const list1NameColIndex = this.options.list1NameColumn.charCodeAt(0) - 65; // A=0, B=1, ...
      const list2NameColIndex = this.options.list2NameColumn.charCodeAt(0) - 65;
      
      // Shromáždění všech jmen z List2 pro efektivní porovnávání
      const list2Names: string[] = [];
      
      // Projděme List2 a extrahujme pouze jména od startRow
      const maxRow2 = Math.min(list2.rowCount, this.options.list2StartRow + this.options.maxRows);
      for (let rowNum = this.options.list2StartRow; rowNum <= maxRow2; rowNum++) {
        const row = list2.getRow(rowNum);
        const nameCell = row.getCell(list2NameColIndex + 1); // +1 protože ExcelJS indexuje od 1
        
        // Přeskočíme buňky bez hodnoty
        if (!nameCell || !nameCell.value) continue;
        
        const name = String(nameCell.value).trim();
        // Přeskočíme prázdné řetězce
        if (!name) continue;
        
        list2Names.push(name);
      }
      
      logger.info(`Načteno jmen z List2`, { count: list2Names.length });
      
      // Statistiky
      const stats: NameComparisonStats = {
        total: 0,
        exactMatches: 0,
        safeMatches: 0,
        noMatches: 0,
        changes: []
      };
      
      // Výsledky porovnání
      const results: NameComparisonResult[] = [];
      
      // Projděme List1 a zpracujme jména - začínáme od řádku 5
      const maxRow1 = Math.min(list1.rowCount, this.options.list1StartRow + this.options.maxRows);
      for (let rowNum = this.options.list1StartRow; rowNum <= maxRow1; rowNum++) {
        const row = list1.getRow(rowNum);
        const nameCell = row.getCell(list1NameColIndex + 1); // +1 protože ExcelJS indexuje od 1
        
        // Přeskočíme buňky bez hodnoty
        if (!nameCell || !nameCell.value) continue;
        
        const originalName = String(nameCell.value).trim();
        // Přeskočíme prázdné řetězce
        if (!originalName) continue;
        
        // Inkrementujeme počítadlo skutečných jmen
        stats.total++;
        
        logger.info(`Zpracovávám jméno`, { 
          rowNum, 
          originalName,
          normalizedName: this.normalizeName(originalName)
        });
        
        // Hledání shody v List2
        let bestMatch = '';
        let matchType: 'exact' | 'safe' | 'none' = 'none';
        let bestScore = 0;
        
        for (const list2Name of list2Names) {
          const comparison = this.compareNames(originalName, list2Name);
          
          if (comparison.exactMatch) {
            // Přesná shoda - použijeme a skončíme hledání
            bestMatch = list2Name;
            matchType = 'exact';
            stats.exactMatches++;
            break;
          }
          
          if (comparison.safeMatch && comparison.score > bestScore) {
            bestMatch = list2Name;
            bestScore = comparison.score;
            matchType = 'safe';
          }
        }
        
        if (matchType === 'safe') {
          stats.safeMatches++;
          logger.info(`Nalezena bezpečná shoda`, { 
            rowNum, 
            originalName, 
            bestMatch, 
            score: bestScore 
          });
        } else if (matchType === 'none') {
          stats.noMatches++;
          logger.info(`Nenalezena žádná shoda`, { rowNum, originalName });
        } else {
          logger.info(`Nalezena přesná shoda`, { rowNum, originalName, bestMatch });
        }
        
        // Vytvoření výsledku pro toto jméno
        const nameChanged = matchType === 'safe';
        const result: NameComparisonResult = {
          nameUpdated: nameChanged,
          originalName: originalName,
          newName: bestMatch || originalName,
          matchType: matchType,
          rowIndex: rowNum,
          score: matchType === 'exact' ? 100 : (matchType === 'safe' ? bestScore : 0)
        };
        
        results.push(result);
        
        if (nameChanged) {
          stats.changes.push(result);
        }
        
        // Obarvení buněk, kde nebyla nalezena shoda
        if (matchType === 'none') {
          const cellToColor = list1.getCell(rowNum, list1NameColIndex + 1);
          cellToColor.style = JSON.parse(JSON.stringify(cellToColor.style));
          cellToColor.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF0000" } // Červená barva pro nenalezené shody
          };
        }
        
        // Aplikace změn do workbooku, pokud je to požadováno
        if (this.options.applyChanges && nameChanged) {
          // Pro bezpečné shody (opravy) nastavíme původní jméno do sloupce A
          // Uložení původního jména do sloupce A (o jeden sloupec doleva)
          const originalNameColumnIndex = list1NameColIndex; // Sloupec B (index 1)
          const backupColumnIndex = originalNameColumnIndex - 1; // Sloupec A (index 0)
          
          // Získáme buňku ve sloupci A ve stejném řádku
          const backupCell = row.getCell(backupColumnIndex + 1); // +1 protože ExcelJS indexuje od 1
          
          // Uložení původního jména do sloupce A
          backupCell.value = originalName;
          
          // Aktualizace hodnoty v listu (sloupec B)
          nameCell.value = bestMatch;
          
          // Obarvení buňky žlutě
          const cellToColor = list1.getCell(rowNum, list1NameColIndex + 1);
          cellToColor.style = JSON.parse(JSON.stringify(cellToColor.style));
          cellToColor.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF00" } // Žlutá barva pro opravené buňky
          };
          
          logger.info(`Jméno aktualizováno v Excel buňce`, { 
            rowNum, 
            originalName,
            newName: bestMatch,
            score: bestScore 
          });
        }
      }
      
      logger.info(`Dokončeno porovnání jmen`, {
        total: stats.total, 
        exactMatches: stats.exactMatches, 
        safeMatches: stats.safeMatches, 
        noMatches: stats.noMatches,
        changes: stats.changes.length
      });
      
      // Kontrola konzistence statistik
      if (stats.exactMatches + stats.safeMatches + stats.noMatches !== stats.total) {
        logger.warn(`Nekonzistentní statistiky`, {
          total: stats.total,
          sum: stats.exactMatches + stats.safeMatches + stats.noMatches
        });
      }
      
      return { 
        results, 
        stats,
        workbook: this.options.applyChanges ? this.workbook : undefined
      };
    } catch (error) {
      logger.error(`Chyba při porovnávání jmen`, { error });
      throw error;
    }
  }

  /**
   * Generování HTML reportu s výsledky porovnání
   * @param results Výsledky porovnání
   * @returns HTML report
   */
  public generateReport(results: NameComparisonOutput): string {
    const stats = results.stats;
    
    // Počet upravených jmen je počet změn (bezpečných shod, kde bylo nutné jméno opravit)
    const changedNamesCount = stats.changes.length;
    
    // Celkový počet nalezených shod (přesné + bezpečné shody)
    const totalFoundMatches = stats.exactMatches + stats.safeMatches;
    
    logger.info(`Generuji HTML report`, {
      totalNames: stats.total,
      totalFoundMatches,
      changedNamesCount,
      noMatches: stats.noMatches
    });
    
    let html = `
      <h2>Statistika porovnání jmen</h2>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr>
          <th>Celkový počet jmen</th>
          <td>${stats.total}</td>
        </tr>
        <tr>
          <th>Nalezené shody</th>
          <td>${totalFoundMatches}</td>
        </tr>
        <tr>
          <th>Počet upravených jmen</th>
          <td>${changedNamesCount}</td>
        </tr>
        <tr>
          <th>Nenalezené shody</th>
          <td>${stats.noMatches}</td>
        </tr>
      </table>
      
      <p class="mt-3">
        V případě opravy jména byla původní hodnota uložena ve sloupci A pro kontrolu.
      </p>
      <p>
        <span style="color: yellow; background-color: #333; padding: 2px 5px;">■</span> Žlutě jsou označena jména, která byla automaticky opravena.
        <br>
        <span style="color: red; background-color: #333; padding: 2px 5px;">■</span> Červeně jsou označena jména, pro která nebyla nalezena shoda.
      </p>`;
    
    return html;
  }

  /**
   * Získání zpracovaného workbooku jako buffer
   * @returns Buffer s Excel souborem
   */
  public async getOutputBuffer(): Promise<Buffer> {
    // Použijeme typové přetypování pro bezpečnější řešení
    const buffer = await this.workbook.xlsx.writeBuffer();
    // Nejprve přetypujeme na unknown a pak na Buffer
    return buffer as unknown as Buffer;
  }
}