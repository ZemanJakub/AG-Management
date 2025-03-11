// modules/avaris/services/timeUpdateService.ts
import * as XLSX from 'xlsx';
import { 
  excelDateToJsDate, 
  excelTimeToJsDate, 
  formatTime 
} from './nameCompareUtils';

interface TimeUpdateOptions {
  list1NameColumn: string;
  list1DateColumn: string;
  list1StartTimeColumn: string;
  list1EndTimeColumn: string;
  list1ActualStartTimeColumn: string;
  list1ActualEndTimeColumn: string;
  list2NameColumn: string;
  list2TimestampColumn: string;
  list1StartRow: number;
  list2StartRow: number;
  timeWindowHours: number;
}

const defaultOptions: TimeUpdateOptions = {
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

interface ShiftInfo {
  name: string;
  date: Date;
  plannedStartTime: Date;
  plannedEndTime: Date;
  plannedStartDateTime: Date;
  plannedEndDateTime: Date;
  rowIndex: number;
}

interface ChipRecord {
  name: string;
  timestamp: Date;
  rowIndex: number;
}

interface TimeUpdateResult {
  shiftIndex: number;
  originalStartTime: Date | null;
  originalEndTime: Date | null;
  newStartTime: Date | null;
  newEndTime: Date | null;
  startTimeUpdated: boolean;
  endTimeUpdated: boolean;
  startTimeFoundInRow?: number;
  endTimeFoundInRow?: number;
  navazujiSmenaBefore?: boolean;
  navazujiSmenaAfter?: boolean;
}

export class TimeUpdateService {
  private options: TimeUpdateOptions;
  private list1Data: any[];
  private list2Data: any[];
  private shifts: ShiftInfo[] = [];
  private chipRecords: ChipRecord[] = [];
  private results: TimeUpdateResult[] = [];
  private usedRows: Set<number> = new Set();
  
  constructor(list1Data: any[], list2Data: any[], options?: Partial<TimeUpdateOptions>) {
    this.options = { ...defaultOptions, ...options };
    this.list1Data = list1Data;
    this.list2Data = list2Data;
    
    // Inicializace dat
    this.loadShifts();
    this.loadChipRecords();
  }
  
  /**
   * Načtení směn z List1
   */
  private loadShifts(): void {
    const nameColIndex = XLSX.utils.decode_col(this.options.list1NameColumn);
    const dateColIndex = XLSX.utils.decode_col(this.options.list1DateColumn);
    const startTimeColIndex = XLSX.utils.decode_col(this.options.list1StartTimeColumn);
    const endTimeColIndex = XLSX.utils.decode_col(this.options.list1EndTimeColumn);
    
    // Procházení řádků od startRow
    for (let i = this.options.list1StartRow - 1; i < this.list1Data.length; i++) {
      const row = this.list1Data[i];
      
      // Přeskočit prázdné řádky
      if (!row || !row[nameColIndex]) continue;
      
      const name = row[nameColIndex];
      
      // Načíst datum a časy
      const excelDate = row[dateColIndex];
      const excelStartTime = row[startTimeColIndex];
      const excelEndTime = row[endTimeColIndex];
      
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
      if (endTime < startTime) {
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
      this.shifts.push({
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
    this.shifts.sort((a, b) => {
      if (a.name !== b.name) return a.name.localeCompare(b.name);
      return a.plannedStartDateTime.getTime() - b.plannedStartDateTime.getTime();
    });
  }
  
  /**
   * Načtení záznamů čipů z List2
   */
  private loadChipRecords(): void {
    const nameColIndex = XLSX.utils.decode_col(this.options.list2NameColumn);
    const timestampColIndex = XLSX.utils.decode_col(this.options.list2TimestampColumn);
    
    // Procházení řádků od startRow
    for (let i = this.options.list2StartRow - 1; i < this.list2Data.length; i++) {
      const row = this.list2Data[i];
      
      // Přeskočit prázdné řádky
      if (!row || !row[nameColIndex] || !row[timestampColIndex]) continue;
      
      const name = row[nameColIndex];
      
      // Formát v B sloupci může být různý, zkusíme detekovat
      let timestamp;
      const timestampValue = row[timestampColIndex];
      
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
      this.chipRecords.push({
        name,
        timestamp,
        rowIndex: i + 1 // +1 pro Excel indexaci řádků od 1
      });
    }
    
    // Seřazení záznamů podle času
    this.chipRecords.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  /**
   * Aktualizace skutečných časů
   */
    public updateActualTimes(): TimeUpdateResult[] {
      // Část 1: Zpracování směn a hledání čipových záznamů
      for (let i = 0; i < this.shifts.length; i++) {
        const shift = this.shifts[i];
        
        const startWindowLower = new Date(shift.plannedStartDateTime);
        startWindowLower.setHours(startWindowLower.getHours() - this.options.timeWindowHours);
        
        const startWindowUpper = new Date(shift.plannedStartDateTime);
        startWindowUpper.setHours(startWindowUpper.getHours() + this.options.timeWindowHours);
        
        const endWindowLower = new Date(shift.plannedEndDateTime);
        endWindowLower.setHours(endWindowLower.getHours() - this.options.timeWindowHours);
        
        const endWindowUpper = new Date(shift.plannedEndDateTime);
        endWindowUpper.setHours(endWindowUpper.getHours() + this.options.timeWindowHours);
        
        let bestStartRecord: ChipRecord | null = null;
        let bestEndRecord: ChipRecord | null = null;
        
        // Hledání nejlepších záznamů pro začátek a konec směny
        for (const record of this.chipRecords) {
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
        const result: TimeUpdateResult = {
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
        
        // Označení použitých řádků v List2
        if (bestStartRecord) {
          this.usedRows.add(bestStartRecord.rowIndex);
        }
        
        if (bestEndRecord) {
          this.usedRows.add(bestEndRecord.rowIndex);
        }
        
        this.results.push(result);
      }
      
      // Část 2: Zpracování navazujících směn
      // Nejprve vytvoříme slovník směn podle jména
      const employeeShifts = new Map<string, number[]>();
      
      this.shifts.forEach((shift, index) => {
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
          shiftIndices.sort((a:any, b:any) => 
            this.shifts[a].plannedStartDateTime.getTime() - this.shifts[b].plannedStartDateTime.getTime()
          );
          
          // Kontrola navazujících směn
          for (let i = 0; i < shiftIndices.length - 1; i++) {
            const currentShiftIndex = shiftIndices[i];
            const nextShiftIndex = shiftIndices[i + 1];
            
            const currentShift = this.shifts[currentShiftIndex];
            const nextShift = this.shifts[nextShiftIndex];
            
            // Kontrola, zda jde o navazující směny (konec první + max 30 minut = začátek druhé)
            const timeDifference = nextShift.plannedStartDateTime.getTime() - currentShift.plannedEndDateTime.getTime();
            
            if (timeDifference >= 0 && timeDifference <= consecutiveThreshold) {
              // Směny navazují - nastavíme automaticky konec první a začátek druhé podle plánu
              
              // Aktualizace pro první směnu - konec bude plánovaný konec
              this.results[currentShiftIndex].newEndTime = currentShift.plannedEndTime;
              this.results[currentShiftIndex].endTimeUpdated = true;
              this.results[currentShiftIndex].navazujiSmenaAfter = true;
              
              // Aktualizace pro druhou směnu - začátek bude plánovaný začátek
              this.results[nextShiftIndex].newStartTime = nextShift.plannedStartTime;
              this.results[nextShiftIndex].startTimeUpdated = true;
              this.results[nextShiftIndex].navazujiSmenaBefore = true;
            }
          }
        }
      }
      
      return this.results;
    }
    
    /**
     * Aplikace aktualizovaných časů do workbooku
     */
    public applyChanges(workbook: XLSX.WorkBook): XLSX.WorkBook {
      const list1 = workbook.Sheets[workbook.SheetNames[0]];
      const list2 = workbook.Sheets[workbook.SheetNames[1]];
      
      // Aplikace změn v List1
      for (const result of this.results) {
        const shift = this.shifts[result.shiftIndex];
        
        // Aktualizace začátku směny (sloupec M)
        if (result.startTimeUpdated) {
          const startCell = XLSX.utils.encode_cell({ 
            r: shift.rowIndex - 1, 
            c: XLSX.utils.decode_col(this.options.list1ActualStartTimeColumn) 
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
                  rgb: result.navazujiSmenaBefore ? 'FF90EE90' : 'FFFFFFFF' // zelené nebo bílé pozadí
                } 
              } 
            }
          };
        } else {
          // Pokud nemáme záznam, nastavíme žluté pozadí
          const startCell = XLSX.utils.encode_cell({ 
            r: shift.rowIndex - 1, 
            c: XLSX.utils.decode_col(this.options.list1ActualStartTimeColumn) 
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
            c: XLSX.utils.decode_col(this.options.list1ActualEndTimeColumn) 
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
                  rgb: result.navazujiSmenaAfter ? 'FF90EE90' : 'FFFFFFFF' // zelené nebo bílé pozadí
                } 
              } 
            }
          };
        } else {
          // Pokud nemáme záznam, nastavíme žluté pozadí
          const endCell = XLSX.utils.encode_cell({ 
            r: shift.rowIndex - 1, 
            c: XLSX.utils.decode_col(this.options.list1ActualEndTimeColumn) 
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
      for (let i = this.options.list2StartRow - 1; i < this.list2Data.length; i++) {
        const timestampCell = XLSX.utils.encode_cell({ 
          r: i, 
          c: XLSX.utils.decode_col(this.options.list2TimestampColumn) 
        });
        
        // Pokud buňka existuje
        if (list2[timestampCell]) {
          // Pokud byl řádek použit, nastavíme zelené pozadí
          if (this.usedRows.has(i + 1)) {
            if (!list2[timestampCell].s) list2[timestampCell].s = {};
            list2[timestampCell].s.fill = { fgColor: { rgb: 'FF90EE90' } }; // zelené pozadí
          } else {
            // Kontrola, zda timestamp spadá do některého z časových oken
            let inWindow = false;
            
            for (const shift of this.shifts) {
              const startWindowLower = new Date(shift.plannedStartDateTime);
              startWindowLower.setHours(startWindowLower.getHours() - this.options.timeWindowHours);
              
              const startWindowUpper = new Date(shift.plannedStartDateTime);
              startWindowUpper.setHours(startWindowUpper.getHours() + this.options.timeWindowHours);
              
              const endWindowLower = new Date(shift.plannedEndDateTime);
              endWindowLower.setHours(endWindowLower.getHours() - this.options.timeWindowHours);
              
              const endWindowUpper = new Date(shift.plannedEndDateTime);
              endWindowUpper.setHours(endWindowUpper.getHours() + this.options.timeWindowHours);
              
              // Získání hodnoty z buňky (může být různých formátů)
              let timestamp;
              const value = list2[timestampCell].v;
              
              if (typeof value === 'string') {
                // Formát může být "DD.MM.YYYY HH:MM:SS" nebo jen "HH:MM:SS"
                const parts = value.split(' ');
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
              } else if (typeof value === 'number') {
                // Pokud jde o Excel datumový formát (sériové číslo)
                timestamp = excelDateToJsDate(value);
              }
              
              // Kontrola, zda timestamp spadá do některého okna
              if (timestamp) {
                const name = this.list2Data[i][XLSX.utils.decode_col(this.options.list2NameColumn)];
                
                // Kontrola jména
                if (name === shift.name) {
                  if ((timestamp >= startWindowLower && timestamp <= startWindowUpper) ||
                      (timestamp >= endWindowLower && timestamp <= endWindowUpper)) {
                    inWindow = true;
                    break;
                  }
                }
              }
            }
            
            // Nastavíme žluté pozadí pro záznamy v okně, které nebyly použity
            if (inWindow) {
              if (!list2[timestampCell].s) list2[timestampCell].s = {};
              list2[timestampCell].s.fill = { fgColor: { rgb: 'FFFFFF00' } }; // žluté pozadí
            }
          }
        }
      }
      
      return workbook;
    }
    
    /**
     * Generování reportu pro aktualizaci časů
     */
    public generateReport(): string {
      // Počítání statistik
      let totalShifts = this.shifts.length;
      let shiftsWithStart = 0;
      let shiftsWithEnd = 0;
      let shiftsWithBoth = 0;
      let consecutiveShifts = 0;
      
      for (const result of this.results) {
        if (result.startTimeUpdated) shiftsWithStart++;
        if (result.endTimeUpdated) shiftsWithEnd++;
        if (result.startTimeUpdated && result.endTimeUpdated) shiftsWithBoth++;
        if (result.navazujiSmenaBefore || result.navazujiSmenaAfter) consecutiveShifts++;
      }
      
      let html = `
        <h2>Statistika aktualizace časů</h2>
        <table border="1" cellspacing="0" cellpadding="5">
          <tr>
            <th>Celkový počet směn</th>
            <td>${totalShifts}</td>
          </tr>
          <tr>
            <th>Směny s nalezeným začátkem</th>
            <td>${shiftsWithStart}</td>
          </tr>
          <tr>
            <th>Směny s nalezeným koncem</th>
            <td>${shiftsWithEnd}</td>
          </tr>
          <tr>
            <th>Směny s nalezeným začátkem i koncem</th>
            <td>${shiftsWithBoth}</td>
          </tr>
          <tr>
            <th>Navazující směny</th>
            <td>${consecutiveShifts}</td>
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
      
      for (let i = 0; i < this.results.length; i++) {
        const result = this.results[i];
        const shift = this.shifts[result.shiftIndex];
        
        let status = "";
        if (result.navazujiSmenaBefore || result.navazujiSmenaAfter) {
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
     * Přidání reportu do workbooku jako nový list
     */
    public addReportToWorkbook(workbook: XLSX.WorkBook): XLSX.WorkBook {
      // Vytvoření nového listu pro report nebo přidání k existujícímu reportu
      const reportSheetName = 'Report';
      
      let reportSheet;
      let startRow = 0;
      
      // Kontrola, zda už list existuje
      if (workbook.SheetNames.includes(reportSheetName)) {
        reportSheet = workbook.Sheets[reportSheetName];
        
        // Najdeme poslední řádek v existujícím reportu
        const range = XLSX.utils.decode_range(reportSheet['!ref'] || 'A1:A1');
        startRow = range.e.r + 2; // Přidáme 2 prázdné řádky
      } else {
        // Vytvoření nového listu
        reportSheet = XLSX.utils.aoa_to_sheet([]);
        workbook.SheetNames.push(reportSheetName);
        workbook.Sheets[reportSheetName] = reportSheet;
      }
      
      // Vytvoření reportu pro aktualizaci časů
      const reportRows = [
        ['Statistika aktualizace časů'],
        [],
        ['Celkový počet směn', this.shifts.length],
        ['Směny s nalezeným začátkem', this.results.filter(r => r.startTimeUpdated).length],
        ['Směny s nalezeným koncem', this.results.filter(r => r.endTimeUpdated).length],
        ['Směny s nalezeným začátkem i koncem', this.results.filter(r => r.startTimeUpdated && r.endTimeUpdated).length],
        ['Navazující směny', this.results.filter(r => r.navazujiSmenaBefore || r.navazujiSmenaAfter).length],
        [],
        ['Detaily aktualizací:'],
        ['Jméno', 'Datum', 'Plánovaný začátek', 'Plánovaný konec', 'Skutečný začátek', 'Skutečný konec', 'Stav']
      ];
      
      // Přidání detailů pro každou směnu
      for (let i = 0; i < this.results.length; i++) {
        const result = this.results[i];
        const shift = this.shifts[result.shiftIndex];
        
        let status = "";
        if (result.navazujiSmenaBefore || result.navazujiSmenaAfter) {
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
        
        reportRows.push([
          shift.name,
          formatDate(shift.date),
          formatTime(shift.plannedStartTime),
          formatTime(shift.plannedEndTime),
          formatTime(result.newStartTime),
          formatTime(result.newEndTime),
          status
        ]);
      }
      
      // Přidání řádků do reportu
      XLSX.utils.sheet_add_aoa(reportSheet, reportRows, { origin: { r: startRow, c: 0 } });
      
      return workbook;
    }
  }