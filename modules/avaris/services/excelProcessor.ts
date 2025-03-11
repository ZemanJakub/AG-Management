// modules/avaris/services/excelProcessor.ts
import * as XLSX from 'xlsx';
import { normalizeName, compareNames, levenshtein, excelDateToJsDate, excelTimeToJsDate, formatTime } from './nameCompareUtils';

// Definice typů pro výsledky porovnání jmen
interface NameComparisonResult {
  nameUpdated: boolean;
  originalName: string;
  newName: string;
  matchType: 'exact' | 'safe' | 'none';
  rowIndex: number;
}

// Definice typů pro statistiky porovnání jmen
interface NameComparisonStats {
  total: number;
  exactMatches: number;
  safeMatches: number;
  noMatches: number;
  changes: NameComparisonResult[];
}

// Definice typů pro směnu
interface Shift {
  name: string;
  date: Date;
  plannedStartTime: Date;
  plannedEndTime: Date;
  plannedStartDateTime: Date;
  plannedEndDateTime: Date;
  rowIndex: number;
}

// Definice typů pro záznam čipu
interface ChipRecord {
  name: string;
  timestamp: Date;
  rowIndex: number;
}

// Základní typ pro výsledek aktualizace času (před zpracováním navazujících směn)
interface TimeUpdateResultBase {
  shiftIndex: number;
  originalStartTime: Date | null;
  originalEndTime: Date | null;
  newStartTime: Date | null;
  newEndTime: Date | null;
  startTimeUpdated: boolean;
  endTimeUpdated: boolean;
  startTimeFoundInRow?: number;
  endTimeFoundInRow?: number;
}

// Rozšířený typ pro výsledek aktualizace času (po zpracování navazujících směn)
interface TimeUpdateResult extends TimeUpdateResultBase {
  navazujiSmenaBefore: boolean;
  navazujiSmenaAfter: boolean;
}

// Definice typů pro statistiky aktualizace časů
interface TimeUpdateStats {
  totalShifts: number;
  shiftsWithStart: number;
  shiftsWithEnd: number;
  shiftsWithBoth: number;
  consecutiveShifts: number;
}

// Definice typů pro návratovou hodnotu z porovnání jmen
interface NameComparisonOutput {
  results: NameComparisonResult[];
  stats: NameComparisonStats;
}

// Definice typů pro návratovou hodnotu z aktualizace časů
interface TimeUpdateOutput {
  results: TimeUpdateResult[];
  shifts: Shift[];
  usedRows: Set<number>;
  stats: TimeUpdateStats;
}

/**
 * Optimalizovaná třída pro zpracování Excel souborů
 */
export class ExcelProcessor {
  private workbook: XLSX.WorkBook;
  private list1Data: any[][];
  private list2Data: any[][];
  
  /**
   * Konstruktor - přijímá buď ArrayBuffer nebo přímo XLSX.WorkBook
   */
  constructor(excelData: ArrayBuffer | XLSX.WorkBook) {
    if (Buffer.isBuffer(excelData)) {
      // Pokud je to Buffer, převedeme ho na ArrayBuffer
      this.workbook = XLSX.read(new Uint8Array(excelData), { type: 'array' });
    } else if (excelData instanceof ArrayBuffer) {
      // Načtení workbooku z ArrayBuffer
      this.workbook = XLSX.read(new Uint8Array(excelData), { type: 'array' });
    } else {
      // Použití již existujícího workbooku
      this.workbook = excelData;
    }
    
    // Kontrola, zda existují požadované listy
    if (!this.workbook.SheetNames.includes('List1')) {
      throw new Error('Excel soubor musí obsahovat list "List1"');
    }
    
    // U List2 volnější kontrola, může být vytvořen během procesu
    const hasSheet2 = this.workbook.SheetNames.includes('List2');
    
    // Načtení dat z listů
    const list1 = this.workbook.Sheets['List1'];
    this.list1Data = XLSX.utils.sheet_to_json(list1, { header: 1 });
    
    if (hasSheet2) {
      const list2 = this.workbook.Sheets['List2'];
      this.list2Data = XLSX.utils.sheet_to_json(list2, { header: 1 });
    } else {
      this.list2Data = [];
    }
  }
  
  /**
   * Kompletní zpracování dat - porovnání jmen a aktualizace časů
   */
  public processAll(): ArrayBuffer {
    // 1. Vytvoříme List2, pokud neexistuje
    this.ensureList2Exists();
    
    // 2. Porovnání a korekce jmen
    this.compareAndFixNames();
    
    // 3. Aktualizace časů
    this.updateActualTimes();
    
    // 4. Vytvoření reportu
    this.createReport();
    
    // Konverze zpět na ArrayBuffer pro export
    return this.getOutputBuffer();
  }
  
  /**
   * Zpracování pouze porovnání jmen
   */
  public processNameComparison(): ArrayBuffer {
    this.ensureList2Exists();
    this.compareAndFixNames();
    this.createReport();
    return this.getOutputBuffer();
  }
  
  /**
   * Zpracování pouze aktualizace časů
   */
  public processTimeUpdate(): ArrayBuffer {
    this.ensureList2Exists();
    this.updateActualTimes();
    this.createReport();
    return this.getOutputBuffer();
  }
  
  /**
   * Získání reportu pro náhled
   */
  public getReport(): { nameReport: string, timeReport: string } {
    this.ensureList2Exists();
    
    // Získání reportu pro jména
    const nameResults = this.compareAndFixNames(false); // bez aplikace změn
    const nameReport = this.generateNameReport(nameResults);
    
    // Získání reportu pro časy
    const timeResults = this.updateActualTimes(false); // bez aplikace změn
    const timeReport = this.generateTimeReport(timeResults);
    
    return { nameReport, timeReport };
  }
  
  /**
   * Kontrola a vytvoření List2, pokud neexistuje
   */
  private ensureList2Exists(): void {
    if (!this.workbook.SheetNames.includes('List2') || this.list2Data.length === 0) {
      // Vytvoříme prázdný List2 s hlavičkou
      this.list2Data = [
        ['Den', 'Čas', 'Místo'],
      ];
      
      const sheet = XLSX.utils.aoa_to_sheet(this.list2Data);
      
      // Přidání listu do workbooku, pokud neexistuje
      if (!this.workbook.SheetNames.includes('List2')) {
        this.workbook.SheetNames.push('List2');
      }
      
      this.workbook.Sheets['List2'] = sheet;
    }
  }
  
  /**
   * Porovnání a korekce jmen
   * @param applyChanges Zda aplikovat změny do workbooku
   * @returns Výsledky porovnání
   */
  private compareAndFixNames(applyChanges: boolean = true): NameComparisonOutput {
    const options = {
      threshold: 2,
      list1NameColumn: 'A',
      list2NameColumn: 'C',
      list1StartRow: 5,
      list2StartRow: 6
    };
    
    // Dekódování indexů sloupců
    const list1NameColIndex = XLSX.utils.decode_col(options.list1NameColumn);
    const list2NameColIndex = XLSX.utils.decode_col(options.list2NameColumn);
    
    // Inicializace mapy jmen z List2 pro efektivní vyhledávání
    const nameMap = new Map<string, { original: string, normalized: string, row: number }[]>();
    
    // Naplnění mapy jmen
    for (let i = options.list2StartRow - 1; i < this.list2Data.length; i++) {
      const row = this.list2Data[i];
      if (!row || !row[list2NameColIndex]) continue;
      
      const originalName = String(row[list2NameColIndex] || '');
      const normalizedName = normalizeName(originalName);
      const nameParts = normalizedName.split(' ');
      if (nameParts.length === 0) continue;
      
      const surnameOnly = nameParts[0]; // První slovo jako příjmení
      
      if (!nameMap.has(surnameOnly)) {
        nameMap.set(surnameOnly, []);
      }
      
      const entries = nameMap.get(surnameOnly);
      if (entries) {
        entries.push({
          original: originalName,
          normalized: normalizedName,
          row: i + 1 // +1 pro Excel indexaci řádků od 1
        });
      }
    }
    
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
    
    // Porovnání jmen
    stats.total = Math.max(0, this.list1Data.length - (options.list1StartRow - 1));
    
    for (let i = options.list1StartRow - 1; i < this.list1Data.length; i++) {
      const row = this.list1Data[i];
      if (!row || !row[list1NameColIndex]) continue;
      
      const originalName = String(row[list1NameColIndex] || '');
      const normalizedName = normalizeName(originalName);
      const nameParts = normalizedName.split(' ');
      if (nameParts.length === 0) continue;
      
      const surname = nameParts[0]; // První slovo jako příjmení
      
      // Hledání potenciálních shod v nameMap pro dané příjmení
      let bestMatch = '';
      let matchType: 'exact' | 'safe' | 'none' = 'none';
      let bestScore = 0;
      
      // Pokud existují jména s tímto příjmením v List2
      if (nameMap.has(surname)) {
        const potentialMatches = nameMap.get(surname) || [];
        const matchResults: { name: string, score: number, row: number }[] = [];
        
        for (const match of potentialMatches) {
          const comparison = compareNames(normalizedName, match.normalized, options.threshold);
          
          if (comparison.exactMatch) {
            // Přesná shoda - ihned použijeme a skončíme
            bestMatch = match.original;
            matchType = 'exact';
            stats.exactMatches++;
            break;
          }
          
          if (comparison.safeMatch && comparison.score > bestScore) {
            matchResults.push({
              name: match.original,
              score: comparison.score,
              row: match.row
            });
          }
        }
        
        // Pokud jsme nenašli přesnou shodu, ale máme bezpečné shody
        if (matchType !== 'exact' && matchResults.length > 0) {
          // Seřadíme podle skóre od nejvyššího
          matchResults.sort((a, b) => b.score - a.score);
          
          // Vybereme nejlepší shodu
          bestMatch = matchResults[0].name;
          matchType = 'safe';
          stats.safeMatches++;
        }
      }
      
      // Pokud jsme nenašli žádnou shodu
      if (matchType === 'none') {
        stats.noMatches++;
      }
      
      // Výsledek porovnání
      const nameChanged = matchType === 'safe';
      const result: NameComparisonResult = {
        nameUpdated: nameChanged,
        originalName: originalName,
        newName: bestMatch || originalName,
        matchType: matchType,
        rowIndex: i + 1 // +1 pro Excel indexaci řádků od 1
      };
      
      results.push(result);
      
      if (nameChanged) {
        stats.changes.push(result);
      }
      
      // Aplikace změn do workbooku, pokud je to požadováno
      if (applyChanges && nameChanged) {
        const list1 = this.workbook.Sheets['List1'];
        const cell = XLSX.utils.encode_cell({ 
          r: i, 
          c: list1NameColIndex 
        });
        
        // Aktualizace hodnoty v listu
        list1[cell] = { 
          t: 's', // typ string
          v: bestMatch, // hodnota
          s: { // styl
            fill: { fgColor: { rgb: 'FFFFFFFF' } } // bílé pozadí
          }
        };
      } else if (applyChanges && matchType === 'none') {
        // Pro nenalezené shody nastavíme červené pozadí
        const list1 = this.workbook.Sheets['List1'];
        const cell = XLSX.utils.encode_cell({ 
          r: i, 
          c: list1NameColIndex 
        });
        
        // Aktualizace stylu buňky
        if (list1[cell]) {
          if (!list1[cell].s) list1[cell].s = {};
          list1[cell].s.fill = { fgColor: { rgb: 'FFFF0000' } }; // červené pozadí
        }
      }
    }
    
    return { results, stats };
  }
  
  /**
   * Aktualizace skutečných časů
   * @param applyChanges Zda aplikovat změny do workbooku
   * @returns Výsledky aktualizace
   */
  private updateActualTimes(applyChanges: boolean = true): any {
    const options = {
      list1NameColumn: 'A',
      list1DateColumn: 'B',
      list1StartTimeColumn: 'C',
      list1EndTimeColumn: 'D',
      list1ActualStartTimeColumn: 'M',
      list1ActualEndTimeColumn: 'N',
      list2NameColumn: 'C',
      list2TimestampColumn: 'B',
      list1StartRow: 5,
      list2StartRow: 6,
      timeWindowHours: 3
    };
    
    // Dekódování indexů sloupců
    const list1NameColIndex = XLSX.utils.decode_col(options.list1NameColumn);
    const list1DateColIndex = XLSX.utils.decode_col(options.list1DateColumn);
    const list1StartTimeColIndex = XLSX.utils.decode_col(options.list1StartTimeColumn);
    const list1EndTimeColIndex = XLSX.utils.decode_col(options.list1EndTimeColumn);
    const list1ActualStartTimeColIndex = XLSX.utils.decode_col(options.list1ActualStartTimeColumn);
    const list1ActualEndTimeColIndex = XLSX.utils.decode_col(options.list1ActualEndTimeColumn);
    const list2NameColIndex = XLSX.utils.decode_col(options.list2NameColumn);
    const list2TimestampColIndex = XLSX.utils.decode_col(options.list2TimestampColumn);
    
    // Načtení směn z List1
    const shifts:Shift[] = [];
    for (let i = options.list1StartRow - 1; i < this.list1Data.length; i++) {
      const row = this.list1Data[i];
      
      // Přeskočit prázdné řádky
      if (!row || !row[list1NameColIndex]) continue;
      
      const name = row[list1NameColIndex];
      
      // Načíst datum a časy
      const excelDate = row[list1DateColIndex];
      const excelStartTime = row[list1StartTimeColIndex];
      const excelEndTime = row[list1EndTimeColIndex];
      
      if (!excelDate || !excelStartTime || !excelEndTime) continue;
      
      // Konverze Excel hodnot na JavaScript Date
      const date = excelDateToJsDate(excelDate);
      const startTime = excelTimeToJsDate(excelStartTime);
      const endTime = excelTimeToJsDate(excelEndTime);
      
      // Vytvoření kompletního data a času pro začátek a konec směny
      const plannedStartDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
      );
      
      let plannedEndDateTime;
      
      // Pokud konec směny je dříve než začátek, předpokládáme přechod do dalšího dne
      if (endTime.getHours() < startTime.getHours() || 
          (endTime.getHours() === startTime.getHours() && endTime.getMinutes() < startTime.getMinutes())) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        plannedEndDateTime = new Date(
          nextDay.getFullYear(),
          nextDay.getMonth(),
          nextDay.getDate(),
          endTime.getHours(),
          endTime.getMinutes()
        );
      } else {
        plannedEndDateTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          endTime.getHours(),
          endTime.getMinutes()
        );
      }
      
      // Přidání směny do pole
      shifts.push({
        name,
        date,
        plannedStartTime: startTime,
        plannedEndTime: endTime,
        plannedStartDateTime,
        plannedEndDateTime,
        rowIndex: i + 1 // +1 pro Excel indexaci řádků od 1
      });
    }
    
    // Seřazení směn podle plánovaného začátku
    shifts.sort((a, b) => {
      if (a.name !== b.name) return a.name.localeCompare(b.name);
      return a.plannedStartDateTime.getTime() - b.plannedStartDateTime.getTime();
    });
    
    // Načtení záznamů čipů z List2
    const chipRecords = [];
    for (let i = options.list2StartRow - 1; i < this.list2Data.length; i++) {
      const row = this.list2Data[i];
      
      // Přeskočit prázdné řádky
      if (!row || !row[list2NameColIndex] || !row[list2TimestampColIndex]) continue;
      
      const name = row[list2NameColIndex];
      
      // Formát v B sloupci může být různý, zkusíme detekovat
      let timestamp;
      const timestampValue = row[list2TimestampColIndex];
      
      // Pokud je to řetězec (DD.MM.YYYY HH:MM:SS nebo HH:MM:SS)
      if (typeof timestampValue === 'string') {
        // Formát může být "DD.MM.YYYY HH:MM:SS" nebo jen "HH:MM:SS"
        const parts = timestampValue.split(' ');
        if (parts.length > 1) {
          // Formát "DD.MM.YYYY HH:MM:SS"
          const dateParts = parts[0].split('.');
          const timeParts = parts[1].split(':');
          
          if (dateParts.length === 3 && timeParts.length >= 2) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Měsíce v JS jsou 0-11
            const year = parseInt(dateParts[2]);
            const hours = parseInt(timeParts[0]);
            const minutes = parseInt(timeParts[1]);
            const seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
            
            timestamp = new Date(year, month, day, hours, minutes, seconds);
          }
        } else {
          // Formát je jen "HH:MM:SS", použijeme aktuální datum
          const timeParts = parts[0].split(':');
          
          if (timeParts.length >= 2) {
            const now = new Date();
            const hours = parseInt(timeParts[0]);
            const minutes = parseInt(timeParts[1]);
            const seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
            
            timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
          }
        }
      } else if (typeof timestampValue === 'number') {
        // Pokud jde o Excel datumový formát (sériové číslo)
        timestamp = excelDateToJsDate(timestampValue);
      }
      
      if (!timestamp) continue;
      
      // Přidání záznamu čipu do pole
      chipRecords.push({
        name,
        timestamp,
        rowIndex: i + 1 // +1 pro Excel indexaci řádků od 1
      });
    }
    
    // Seřazení záznamů podle času
    chipRecords.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Aktualizace časů - vytvoření výsledků
    const results = [];
    const usedRows = new Set<number>();
    
    // Zpracování směn a hledání čipových záznamů
    for (let i = 0; i < shifts.length; i++) {
      const shift = shifts[i];
      
      const startWindowLower = new Date(shift.plannedStartDateTime);
      startWindowLower.setHours(startWindowLower.getHours() - options.timeWindowHours);
      
      const startWindowUpper = new Date(shift.plannedStartDateTime);
      startWindowUpper.setHours(startWindowUpper.getHours() + options.timeWindowHours);
      
      const endWindowLower = new Date(shift.plannedEndDateTime);
      endWindowLower.setHours(endWindowLower.getHours() - options.timeWindowHours);
      
      const endWindowUpper = new Date(shift.plannedEndDateTime);
      endWindowUpper.setHours(endWindowUpper.getHours() + options.timeWindowHours);
      
      let bestStartRecord = null;
      let bestEndRecord = null;
      
      // Hledání nejlepších záznamů pro začátek a konec směny
      for (const record of chipRecords) {
        // Přeskočit záznamy s jiným jménem
        if (record.name !== shift.name) continue;
        
        // Kontrola, zda záznam spadá do časového okna pro začátek směny
        if (record.timestamp >= startWindowLower && record.timestamp <= startWindowUpper) {
          // Pro začátek hledáme nejranější záznam
          if (!bestStartRecord || record.timestamp < bestStartRecord.timestamp) {
            bestStartRecord = record;
          }
        }
        
        // Kontrola, zda záznam spadá do časového okna pro konec směny
        if (record.timestamp >= endWindowLower && record.timestamp <= endWindowUpper) {
          // Pro konec hledáme nejpozdější záznam
          if (!bestEndRecord || record.timestamp > bestEndRecord.timestamp) {
            bestEndRecord = record;
          }
        }
      }
      
      // Vytvoření výsledku pro tuto směnu
      const result = {
        shiftIndex: i,
        originalStartTime: null,
        originalEndTime: null,
        newStartTime: bestStartRecord ? bestStartRecord.timestamp : null,
        newEndTime: bestEndRecord ? bestEndRecord.timestamp : null,
        startTimeUpdated: !!bestStartRecord,
        endTimeUpdated: !!bestEndRecord,
        startTimeFoundInRow: bestStartRecord ? bestStartRecord.rowIndex : undefined,
        endTimeFoundInRow: bestEndRecord ? bestEndRecord.rowIndex : undefined
      };
      
      // Označení použitých řádků
      if (bestStartRecord) {
        usedRows.add(bestStartRecord.rowIndex);
      }
      
      if (bestEndRecord) {
        usedRows.add(bestEndRecord.rowIndex);
      }
      
      results.push(result);
    }
    
    // Zpracování navazujících směn
    // Nejprve vytvoříme slovník směn podle jména
    const employeeShifts = new Map<string, number[]>();
    
    shifts.forEach((shift, index) => {
      if (!employeeShifts.has(shift.name)) {
        employeeShifts.set(shift.name, []);
      }
      employeeShifts.get(shift.name)?.push(index);
    });
    
    // Práh pro navazující směny v milisekundách (30 minut)
    const consecutiveThreshold = 30 * 60 * 1000;
    
    // Procházení všech zaměstnanců
    for (const [name, shiftIndices] of Array.from(employeeShifts.entries())) {
      // Pokud má zaměstnanec více než jednu směnu
      if (shiftIndices.length > 1) {
        // Seřazení směn podle času začátku
        shiftIndices.sort((a, b) => 
          shifts[a].plannedStartDateTime.getTime() - shifts[b].plannedStartDateTime.getTime()
        );
        
        // Kontrola navazujících směn
        for (let i = 0; i < shiftIndices.length - 1; i++) {
          const currentShiftIndex = shiftIndices[i];
          const nextShiftIndex = shiftIndices[i + 1];
          
          const currentShift = shifts[currentShiftIndex];
          const nextShift = shifts[nextShiftIndex];
          
          // Kontrola, zda jde o navazující směny (konec první + max 30 minut = začátek druhé)
          const timeDifference = nextShift.plannedStartDateTime.getTime() - currentShift.plannedEndDateTime.getTime();
          
          if (timeDifference >= 0 && timeDifference <= consecutiveThreshold) {
            // Směny navazují - nastavíme automaticky konec první a začátek druhé podle plánu
            
            // Aktualizace pro první směnu - konec bude plánovaný konec
            if (currentShiftIndex >= 0 && currentShiftIndex < results.length) {
              const currentResult = results[currentShiftIndex] as TimeUpdateResult;
              currentResult.newEndTime = currentShift.plannedEndTime;
              currentResult.endTimeUpdated = true;
              currentResult.navazujiSmenaAfter = true;
            }
            
            // Aktualizace pro druhou směnu - začátek bude plánovaný začátek
            if (nextShiftIndex >= 0 && nextShiftIndex < results.length) {
              const nextResult = results[nextShiftIndex] as TimeUpdateResult;
              nextResult.newStartTime = nextShift.plannedStartTime;
              nextResult.startTimeUpdated = true;
              nextResult.navazujiSmenaBefore = true;
            }
          }
        }
      }
    }
    
    // Aplikace změn do workbooku, pokud je to požadováno
    if (applyChanges) {
      const list1 = this.workbook.Sheets['List1'];
      
      // Aplikace změn v List1
      for (const result of results) {
        const shift = shifts[result.shiftIndex];
        
        // Aktualizace začátku směny (sloupec M)
        if (result.startTimeUpdated) {
          const startCell = XLSX.utils.encode_cell({ 
            r: shift.rowIndex - 1, 
            c: list1ActualStartTimeColIndex 
          });
          
          // Vytvoření Excel časové hodnoty (část dne)
          const startTime = result.newStartTime as Date;
          const excelTime = (startTime.getHours() * 3600 + startTime.getMinutes() * 60) / 86400;
          
          // Aktualizace buňky
          list1[startCell] = { 
            t: 'n', // typ číslo
            v: excelTime, // hodnota
            z: 'h:mm', // formát
            s: { // styl
              fill: { 
                fgColor: { 
                  rgb: (result as any).navazujiSmenaBefore ? 'FF90EE90' : 'FFFFFFFF' // zelené nebo bílé pozadí
                } 
              } 
            }
          };
        } else {
          // Pokud nemáme záznam, nastavíme žluté pozadí
          const startCell = XLSX.utils.encode_cell({ 
            r: shift.rowIndex - 1, 
            c: list1ActualStartTimeColIndex 
          });
          
          // Vytvoření prázdné buňky se žlutým pozadím
          list1[startCell] = { 
            t: 's', // typ string
            v: '', // prázdná hodnota
            s: { // styl
              fill: { fgColor: { rgb: 'FFFFFF00' } } // žluté pozadí
            }
          };
        }
        
        // Aktualizace konce směny (sloupec N)
        if (result.endTimeUpdated) {
          const endCell = XLSX.utils.encode_cell({ 
            r: shift.rowIndex - 1, 
            c: list1ActualEndTimeColIndex 
          });
          
          // Vytvoření Excel časové hodnoty (část dne)
          const endTime = result.newEndTime as Date;
          const excelTime = (endTime.getHours() * 3600 + endTime.getMinutes() * 60) / 86400;
          
          // Aktualizace buňky
          list1[endCell] = { 
            t: 'n', // typ číslo
            v: excelTime, // hodnota
            z: 'h:mm', // formát
            s: { // styl
              fill: { 
                fgColor: { 
                  rgb: (result as any).navazujiSmenaAfter ? 'FF90EE90' : 'FFFFFFFF' // zelené nebo bílé pozadí
                } 
              } 
            }
          };
        } else {
          // Pokud nemáme záznam, nastavíme žluté pozadí
          const endCell = XLSX.utils.encode_cell({ 
            r: shift.rowIndex - 1, 
            c: list1ActualEndTimeColIndex 
          });
          
          // Vytvoření prázdné buňky se žlutým pozadím
          list1[endCell] = { 
            t: 's', // typ string
            v: '', // prázdná hodnota
            s: { // styl
              fill: { fgColor: { rgb: 'FFFFFF00' } } // žluté pozadí
            }
          };
        }
      }
      
      // Zvýrazníme použité řádky v List2 zeleně
      if (this.workbook.SheetNames.includes('List2')) {
        const list2 = this.workbook.Sheets['List2'];
        
        for (let i = options.list2StartRow - 1; i < this.list2Data.length; i++) {
          const timestampCell = XLSX.utils.encode_cell({ 
            r: i, 
            c: list2TimestampColIndex 
          });
          
          // Pokud buňka existuje
          if (list2[timestampCell]) {
            // Pokud byl řádek použit, nastavíme zelené pozadí
            if (usedRows.has(i + 1)) {
              if (!list2[timestampCell].s) list2[timestampCell].s = {};
              list2[timestampCell].s.fill = { fgColor: { rgb: 'FF90EE90' } }; // zelené pozadí
            }
          }
        }
      }
    }
    
    // Výpočet statistik
    let totalShifts = shifts.length;
    let shiftsWithStart = 0;
    let shiftsWithEnd = 0;
    let shiftsWithBoth = 0;
    let consecutiveShifts = 0;
    
    for (const resultBase of results) {
      const result = resultBase as TimeUpdateResult;
      if (result.startTimeUpdated) shiftsWithStart++;
      if (result.endTimeUpdated) shiftsWithEnd++;
      if (result.startTimeUpdated && result.endTimeUpdated) shiftsWithBoth++;
      if ((result as any).navazujiSmenaBefore || (result as any).navazujiSmenaAfter) consecutiveShifts++;
    }
    
    return { 
      results, 
      shifts,
      usedRows,
      stats: {
        totalShifts,
        shiftsWithStart,
        shiftsWithEnd,
        shiftsWithBoth,
        consecutiveShifts
      }
    };
  }
  
  /**
   * Vytvoření reportu pro porovnání jmen
   */
  private generateNameReport(nameResults: NameComparisonOutput): string {
    const stats = nameResults.stats;
    
    let html = `
      <h2>Statistika porovnání jmen</h2>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr>
          <th>Celkový počet jmen</th>
          <td>${stats.total}</td>
        </tr>
        <tr>
          <th>Přesné shody</th>
          <td>${stats.exactMatches}</td>
        </tr>
        <tr>
          <th>Bezpečné shody</th>
          <td>${stats.safeMatches}</td>
        </tr>
        <tr>
          <th>Nenalezené shody</th>
          <td>${stats.noMatches}</td>
        </tr>
      </table>
      
      <h3>Provedené změny</h3>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr>
          <th>Řádek</th>
          <th>Původní jméno</th>
          <th>Nové jméno</th>
          <th>Typ shody</th>
        </tr>
    `;
    
    for (const change of stats.changes) {
      html += `
        <tr>
          <td>${change.rowIndex}</td>
          <td>${change.originalName}</td>
          <td>${change.newName}</td>
          <td>${change.matchType === 'exact' ? 'Přesná' : 'Bezpečná'}</td>
        </tr>
      `;
    }
    
    html += '</table>';
    return html;
  }
  
  /**
   * Vytvoření reportu pro aktualizaci časů
   */
  private generateTimeReport(timeResults: TimeUpdateOutput): string {
    const { stats, shifts, results } = timeResults;
    
    let html = `
      <h2>Statistika aktualizace časů</h2>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr>
          <th>Celkový počet směn</th>
          <td>${stats.totalShifts}</td>
        </tr>
        <tr>
          <th>Směny s nalezeným začátkem</th>
          <td>${stats.shiftsWithStart}</td>
        </tr>
        <tr>
          <th>Směny s nalezeným koncem</th>
          <td>${stats.shiftsWithEnd}</td>
        </tr>
        <tr>
          <th>Směny s nalezeným začátkem i koncem</th>
          <td>${stats.shiftsWithBoth}</td>
        </tr>
        <tr>
          <th>Navazující směny</th>
          <td>${stats.consecutiveShifts}</td>
        </tr>
      </table>
      
      <h3>Detaily aktualizací</h3>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr>
          <th>Jméno</th>
          <th>Datum</th>
          <th>Plánovaný začátek</th>
          <th>Plánovaný konec</th>
          <th>Skutečný začátek</th>
          <th>Skutečný konec</th>
          <th>Stav</th>
        </tr>
    `;
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i] as TimeUpdateResult;
      const shift = shifts[result.shiftIndex];
      
      let status = "";
      if ((result as any).navazujiSmenaBefore || (result as any).navazujiSmenaAfter) {
        status = "Navazující směna";
      } else if (result.startTimeUpdated && result.endTimeUpdated) {
        status = "Kompletní";
      } else if (result.startTimeUpdated) {
        status = "Pouze začátek";
      } else if (result.endTimeUpdated) {
        status = "Pouze konec";
      } else {
        status = "Bez záznamů";
      }
      
      const formatDateTime = (date: Date) => {
        return date.toLocaleString('cs-CZ', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit', 
          minute: '2-digit'
        });
      };
      
      const formatDateOnly = (date: Date) => {
        return date.toLocaleDateString('cs-CZ', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric'
        });
      };
      
      const formatTimeOnly = (date: Date | null) => {
        if (!date) return "-";
        return date.toLocaleTimeString('cs-CZ', { 
          hour: '2-digit', 
          minute: '2-digit'
        });
      };
      
      html += `
        <tr>
          <td>${shift.name}</td>
          <td>${formatDateOnly(shift.date)}</td>
          <td>${formatTimeOnly(shift.plannedStartTime)}</td>
          <td>${formatTimeOnly(shift.plannedEndTime)}</td>
          <td>${formatTimeOnly(result.newStartTime)}</td>
          <td>${formatTimeOnly(result.newEndTime)}</td>
          <td>${status}</td>
        </tr>
      `;
    }
    
    html += '</table>';
    return html;
  }
  
  /**
   * Vytvoření reportu s výsledky
   */
  private createReport(): void {
    // Vytvoření nového listu pro report nebo přidání k existujícímu reportu
    const reportSheetName = 'Report';
    
    // Kontrola, zda už list existuje a případně ho odstraníme
    if (this.workbook.SheetNames.includes(reportSheetName)) {
      const index = this.workbook.SheetNames.indexOf(reportSheetName);
      this.workbook.SheetNames.splice(index, 1);
      delete this.workbook.Sheets[reportSheetName];
    }
    
    // Získání výsledků porovnání jmen a aktualizace časů
    const nameResults = this.compareAndFixNames(false) as NameComparisonOutput;
    const timeResults = this.updateActualTimes(false) as TimeUpdateOutput;
    
    // Vytvoření reportu pro jména
    const nameReportRows: (string | number | null)[][] = [
      ['Statistika porovnání jmen'],
      [],
      ['Celkový počet jmen', nameResults.stats.total],
      ['Přesné shody', nameResults.stats.exactMatches],
      ['Bezpečné shody', nameResults.stats.safeMatches],
      ['Nenalezené shody', nameResults.stats.noMatches],
      [],
      ['Provedené změny:'],
      ['Řádek', 'Původní jméno', 'Nové jméno', 'Typ shody']
    ];
    
    // Přidání změn jmen do reportu
    for (const change of nameResults.stats.changes) {
      const rowData: (string | number)[] = [
        change.rowIndex, 
        change.originalName, 
        change.newName, 
        change.matchType === 'exact' ? 'Přesná' : 'Bezpečná'
      ];
      nameReportRows.push(rowData);
    }
    
    // Přidání mezery mezi reporty
    nameReportRows.push([]);
    nameReportRows.push([]);
    
    // Přidání reportu časů
    nameReportRows.push(['Statistika aktualizace časů']);
    nameReportRows.push([]);
    nameReportRows.push(['Celkový počet směn', timeResults.stats.totalShifts]);
    nameReportRows.push(['Směny s nalezeným začátkem', timeResults.stats.shiftsWithStart]);
    nameReportRows.push(['Směny s nalezeným koncem', timeResults.stats.shiftsWithEnd]);
    nameReportRows.push(['Směny s nalezeným začátkem i koncem', timeResults.stats.shiftsWithBoth]);
    nameReportRows.push(['Navazující směny', timeResults.stats.consecutiveShifts]);
    nameReportRows.push([]);
    nameReportRows.push(['Detaily aktualizací:']);
    nameReportRows.push(['Jméno', 'Datum', 'Plánovaný začátek', 'Plánovaný konec', 'Skutečný začátek', 'Skutečný konec', 'Stav']);
    
    // Přidání detailů aktualizací časů
    for (let i = 0; i < timeResults.results.length; i++) {
      const result = timeResults.results[i] as TimeUpdateResult;
      const shift = timeResults.shifts[result.shiftIndex];
      
      let status = "";
      if ((result as any).navazujiSmenaBefore || (result as any).navazujiSmenaAfter) {
        status = "Navazující směna";
      } else if (result.startTimeUpdated && result.endTimeUpdated) {
        status = "Kompletní";
      } else if (result.startTimeUpdated) {
        status = "Pouze začátek";
      } else if (result.endTimeUpdated) {
        status = "Pouze konec";
      } else {
        status = "Bez záznamů";
      }
      
      const formatDate = (date: Date) => {
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
      };
      
      const formatTime = (date: Date | null) => {
        if (!date) return "-";
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      };
      
      nameReportRows.push([
        shift.name,
        formatDate(shift.date),
        formatTime(shift.plannedStartTime),
        formatTime(shift.plannedEndTime),
        formatTime(result.newStartTime),
        formatTime(result.newEndTime),
        status
      ]);
    }
    
    // Vytvoření nového listu z dat
    const reportSheet = XLSX.utils.aoa_to_sheet(nameReportRows);
    
    // Přidání listu do workbooku
    this.workbook.SheetNames.push(reportSheetName);
    this.workbook.Sheets[reportSheetName] = reportSheet;
  }
  
  /**
   * Získání výsledného workbooku jako ArrayBuffer
   */
  private getOutputBuffer(): ArrayBuffer {
    const buffer = XLSX.write(this.workbook, { type: "array", bookType: "xlsx" });
    return buffer;
  }
}