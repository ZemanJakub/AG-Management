// modules/podklady/services/shiftTimeProcessor.ts
import { ShiftData, ClockRecord } from "./excelDataExtractor";
import { StructuredLogger } from "./structuredLogger";

const logger = StructuredLogger.getInstance().getComponentLogger("shift-time-processor");

export interface TimeUpdateResult {
  updatedShifts: number;
  entriesFound: number;
  exitsFound: number;
  reportLines: string[];
  usedRowsStart: Map<number, number>; // Mapa řádků List1 -> odpovídající řádky List2 pro čas příchodu
  usedRowsEnd: Map<number, number>;   // Mapa řádků List1 -> odpovídající řádky List2 pro čas odchodu
  timeWindowHours?: number;
}

/**
 * Funkce pro aktualizaci časů příchodů a odchodů - implementuje logiku Excel makra
 * @param shifts Seznam směn zaměstnanců
 * @param clockRecords Seznam čipovacích záznamů
 * @param consecutiveShifts Seznam navazujících směn
 * @returns Výsledky aktualizace
 */
export function updateShiftTimes(
    shifts: ShiftData[],
    clockRecords: ClockRecord[],
    consecutiveShifts: { first: ShiftData; second: ShiftData }[],
    options?: { timeWindowHours?: number }
  ): TimeUpdateResult {
    // Inicializace statistik a reportu
    let updatedShifts = 0;
    let entriesFound = 0;
    let exitsFound = 0;
    const reportLines: string[] = [];
    
    // Vytvoření map pro uložení použitých řádků z List2
    const usedRowsStart = new Map<number, number>();
    const usedRowsEnd = new Map<number, number>();
    const timeWindowHours = options?.timeWindowHours || 3;
    
    // Vytvoření mapy navazujících směn pro rychlejší vyhledávání
    const consecutiveMap = new Map<number, { isFirst: boolean; pair: { first: ShiftData; second: ShiftData } }>();
    for (const pair of consecutiveShifts) {
      // Uložení informací o navazujících směnách do mapy
      consecutiveMap.set(pair.first.rowIndex, { isFirst: true, pair });
      consecutiveMap.set(pair.second.rowIndex, { isFirst: false, pair });
      
      logger.info(`POSLEDNÍ KONTROLA navazujících směn`, { name: pair.first.name });
      
      // Vynucení správného času konce první směny
      if (pair.first.plannedEnd) {
        const exactEndTime = new Date(pair.first.date);
        exactEndTime.setHours(pair.first.plannedEnd.getHours());
        exactEndTime.setMinutes(pair.first.plannedEnd.getMinutes());
        exactEndTime.setSeconds(0);
        exactEndTime.setMilliseconds(0);
        
        // Přepíšeme hodnotu bez ohledu na to, co tam bylo dříve
        pair.first.actualEnd = exactEndTime;
        logger.info(`VYNUCENÍ konce první směny`, {
          time: formatTime(exactEndTime),
          rowIndex: pair.first.rowIndex
        });
      }
      
      // Vynucení správného času začátku druhé směny
      if (pair.second.plannedStart) {
        const exactStartTime = new Date(pair.second.date);
        exactStartTime.setHours(pair.second.plannedStart.getHours());
        exactStartTime.setMinutes(pair.second.plannedStart.getMinutes());
        exactStartTime.setSeconds(0);
        exactStartTime.setMilliseconds(0);
        
        // Přepíšeme hodnotu bez ohledu na to, co tam bylo dříve
        pair.second.actualStart = exactStartTime;
        logger.info(`VYNUCENÍ začátku druhé směny`, {
          time: formatTime(exactStartTime),
          rowIndex: pair.second.rowIndex
        });
      }
    }
    
    logger.info(`Začínám aktualizaci časů`, {
      shiftsCount: shifts.length,
      navazujicichCount: consecutiveShifts.length * 2
    });
    
    // === Část 1: Zpracování všech směn včetně hledání příchodů a odchodů pro navazující směny ===
    for (const shift of shifts) {
      // Přeskočíme směny, které nemají jméno nebo datum
      if (!shift.name || !shift.date) {
        logger.debug(`Přeskakuji směnu bez jména nebo data`, { rowIndex: shift.rowIndex });
        continue;
      }
      
      // Přeskočíme směny, které už mají nastaveny oba časy
      if (shift.actualStart && shift.actualEnd) {
        // Pokud již existují aktuální časy, pokusíme se najít odpovídající řádky v List2
        for (const record of clockRecords) {
          if (record.name === shift.name) {
            // Porovnání pouze času ve formátu "hh:mm"
            const formatTimeForComparison = (date?: Date) => {
              if (!date) return "";
              return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            };
            
            if (formatTimeForComparison(record.time) === formatTimeForComparison(shift.actualStart)) {
              usedRowsStart.set(shift.rowIndex, record.rowIndex);
              logger.info(`Nalezena shoda pro existující příchod směny`, {
                name: shift.name,
                rowIndex: shift.rowIndex,
                list2RowIndex: record.rowIndex
              });
            }
            
            if (formatTimeForComparison(record.time) === formatTimeForComparison(shift.actualEnd)) {
              usedRowsEnd.set(shift.rowIndex, record.rowIndex);
              logger.info(`Nalezena shoda pro existující odchod směny`, {
                name: shift.name,
                rowIndex: shift.rowIndex,
                list2RowIndex: record.rowIndex
              });
            }
          }
        }
        logger.debug(`Přeskakuji směnu, která už má nastaveny oba časy`, { rowIndex: shift.rowIndex });
        continue;
      }
      
      // Kontrola, zda máme plánované časy
      if (!shift.plannedStart || !shift.plannedEnd) {
        logger.debug(`Přeskakuji směnu bez plánovaných časů`, { rowIndex: shift.rowIndex });
        continue;
      }
      
      // Kontrola, zda je směna součástí navazujícího páru
      const consecutive = consecutiveMap.get(shift.rowIndex);
      
      // Výpočet plánovaného začátku a konce (stejný pro běžné i navazující směny)
      const plannedStartDateTime = new Date(shift.date);
      plannedStartDateTime.setHours(shift.plannedStart.getHours());
      plannedStartDateTime.setMinutes(shift.plannedStart.getMinutes());
      plannedStartDateTime.setSeconds(0);
      plannedStartDateTime.setMilliseconds(0);
      
      let plannedEndDateTime = new Date(shift.date);
      plannedEndDateTime.setHours(shift.plannedEnd.getHours());
      plannedEndDateTime.setMinutes(shift.plannedEnd.getMinutes());
      plannedEndDateTime.setSeconds(0);
      plannedEndDateTime.setMilliseconds(0);
      
      // Pokud plánovaný konec je dříve než začátek, přidáme 1 den (noční směna)
      if (shift.plannedEnd.getHours() < shift.plannedStart.getHours() ||
          (shift.plannedEnd.getHours() === shift.plannedStart.getHours() && 
           shift.plannedEnd.getMinutes() < shift.plannedStart.getMinutes())) {
        plannedEndDateTime.setDate(plannedEndDateTime.getDate() + 1);
      }
      
      // Časová okna pro hledání čipovacích záznamů (±3 hodiny)
      const windowStartLower = new Date(plannedStartDateTime.getTime() - timeWindowHours * 60 * 60 * 1000);
      const windowStartUpper = new Date(plannedStartDateTime.getTime() + timeWindowHours * 60 * 60 * 1000);
   
      const windowEndLower = new Date(plannedEndDateTime.getTime() - timeWindowHours * 60 * 60 * 1000);
      const windowEndUpper = new Date(plannedEndDateTime.getTime() + timeWindowHours * 60 * 60 * 1000);
      
      let shiftUpdated = false;
      
      // Proměnné pro hledání nejlepších záznamů
      let bestStartRecord: ClockRecord | null = null;
      let bestEndRecord: ClockRecord | null = null;
      
      // Pro navazující směny zpracujeme pouze relevantní čas
      if (consecutive) {
        logger.info(`Zpracovávám navazující směnu`, { 
          name: shift.name, 
          rowIndex: shift.rowIndex,
          plannedDate: formatDateTime(shift.date, shift.plannedStart, shift.plannedEnd),
          isFirst: consecutive.isFirst
        });
        
        if (consecutive.isFirst) {
          // Pro první směnu z páru hledáme pouze čas příchodu
          for (const record of clockRecords) {
            // Přeskočit záznamy s jiným jménem
            if (record.name !== shift.name) continue;
            
            // Kontrola, zda záznam spadá do časového okna pro začátek směny
            if (record.combinedDateTime >= windowStartLower && record.combinedDateTime <= windowStartUpper) {
              // Pro začátek hledáme nejranější záznam
              if (!bestStartRecord || record.combinedDateTime < bestStartRecord.combinedDateTime) {
                bestStartRecord = record;
              }
            }
          }
          
          // Nastavení času příchodu pro první směnu z páru
          if (bestStartRecord) {
            shift.actualStart = new Date(bestStartRecord.combinedDateTime);
            usedRowsStart.set(shift.rowIndex, bestStartRecord.rowIndex);
            
            logger.info(`Nalezen příchod pro první navazující směnu`, {
              name: shift.name,
              rowIndex: shift.rowIndex,
              time: formatTime(bestStartRecord.combinedDateTime),
              list2RowIndex: bestStartRecord.rowIndex
            });
            
            reportLines.push(`- Nalezen příchod pro první navazující směnu ${shift.name} (řádek ${shift.rowIndex}): ${formatTime(bestStartRecord.combinedDateTime)} (řádek List2: ${bestStartRecord.rowIndex})`);
            entriesFound++;
            shiftUpdated = true;
          } else {
            logger.info(`Nenalezen příchod pro první navazující směnu`, {
              name: shift.name,
              rowIndex: shift.rowIndex
            });
          }
          
          // Čas odchodu pro první směnu už byl nastaven na přesný plánovaný čas
        } else {
          // Pro druhou směnu z páru hledáme pouze čas odchodu
          for (const record of clockRecords) {
            // Přeskočit záznamy s jiným jménem
            if (record.name !== shift.name) continue;
            
            // Kontrola, zda záznam spadá do časového okna pro konec směny
            if (record.combinedDateTime >= windowEndLower && record.combinedDateTime <= windowEndUpper) {
              // Pro konec hledáme nejpozdější záznam
              if (!bestEndRecord || record.combinedDateTime > bestEndRecord.combinedDateTime) {
                bestEndRecord = record;
              }
            }
          }
          
          // Nastavení času odchodu pro druhou směnu z páru
          if (bestEndRecord) {
            shift.actualEnd = new Date(bestEndRecord.combinedDateTime);
            usedRowsEnd.set(shift.rowIndex, bestEndRecord.rowIndex);
            
            logger.info(`Nalezen odchod pro druhou navazující směnu`, {
              name: shift.name,
              rowIndex: shift.rowIndex,
              time: formatTime(bestEndRecord.combinedDateTime),
              list2RowIndex: bestEndRecord.rowIndex
            });
            
            reportLines.push(`- Nalezen odchod pro druhou navazující směnu ${shift.name} (řádek ${shift.rowIndex}): ${formatTime(bestEndRecord.combinedDateTime)} (řádek List2: ${bestEndRecord.rowIndex})`);
            exitsFound++;
            shiftUpdated = true;
          } else {
            logger.info(`Nenalezen odchod pro druhou navazující směnu`, {
              name: shift.name,
              rowIndex: shift.rowIndex
            });
          }
          
          // Čas příchodu pro druhou směnu už byl nastaven na přesný plánovaný čas
        }
        
        if (shiftUpdated) {
          updatedShifts++;
        }
      } else {
        // Běžné směny (původní kód)
        logger.info(`Zpracovávám běžnou směnu`, { 
          name: shift.name, 
          rowIndex: shift.rowIndex,
          plannedDate: formatDateTime(shift.date, shift.plannedStart, shift.plannedEnd)
        });
        
        // Procházení čipovacích záznamů a hledání nejlepších kandidátů
        for (const record of clockRecords) {
          // Přeskočit záznamy s jiným jménem
          if (record.name !== shift.name) continue;
          
          // Kontrola, zda záznam spadá do časového okna pro začátek směny
          if (record.combinedDateTime >= windowStartLower && record.combinedDateTime <= windowStartUpper) {
            // Pro začátek hledáme nejranější záznam
            if (!bestStartRecord || record.combinedDateTime < bestStartRecord.combinedDateTime) {
              bestStartRecord = record;
            }
          }
          
          // Kontrola, zda záznam spadá do časového okna pro konec směny
          if (record.combinedDateTime >= windowEndLower && record.combinedDateTime <= windowEndUpper) {
            // Pro konec hledáme nejpozdější záznam
            if (!bestEndRecord || record.combinedDateTime > bestEndRecord.combinedDateTime) {
              bestEndRecord = record;
            }
          }
        }
        
        // Nastavení času příchodu pro běžnou směnu
        if (bestStartRecord) {
          shift.actualStart = new Date(bestStartRecord.combinedDateTime);
          usedRowsStart.set(shift.rowIndex, bestStartRecord.rowIndex);
          
          logger.info(`Nalezen příchod pro běžnou směnu`, {
            name: shift.name,
            rowIndex: shift.rowIndex,
            time: formatTime(bestStartRecord.combinedDateTime),
            list2RowIndex: bestStartRecord.rowIndex
          });
          
          reportLines.push(`- Nalezen příchod pro ${shift.name} (řádek ${shift.rowIndex}): ${formatTime(bestStartRecord.combinedDateTime)} (řádek List2: ${bestStartRecord.rowIndex})`);
          entriesFound++;
          shiftUpdated = true;
        } else {
          shift.actualStart = undefined;
          logger.info(`Nenalezen příchod pro běžnou směnu`, {
            name: shift.name,
            rowIndex: shift.rowIndex
          });
        }
        
        // Nastavení času odchodu pro běžnou směnu
        if (bestEndRecord) {
          shift.actualEnd = new Date(bestEndRecord.combinedDateTime);
          usedRowsEnd.set(shift.rowIndex, bestEndRecord.rowIndex);
          
          logger.info(`Nalezen odchod pro běžnou směnu`, {
            name: shift.name,
            rowIndex: shift.rowIndex,
            time: formatTime(bestEndRecord.combinedDateTime),
            list2RowIndex: bestEndRecord.rowIndex
          });
          
          reportLines.push(`- Nalezen odchod pro ${shift.name} (řádek ${shift.rowIndex}): ${formatTime(bestEndRecord.combinedDateTime)} (řádek List2: ${bestEndRecord.rowIndex})`);
          exitsFound++;
          shiftUpdated = true;
        } else {
          shift.actualEnd = undefined;
          logger.info(`Nenalezen odchod pro běžnou směnu`, {
            name: shift.name,
            rowIndex: shift.rowIndex
          });
        }
        
        if (shiftUpdated) {
          updatedShifts++;
        }
      }
    }
    
    logger.info(`Celkové statistiky aktualizace časů`, {
      updatedShifts,
      entriesFound,
      exitsFound,
      usedRowsStartSize: usedRowsStart.size,
      usedRowsEndSize: usedRowsEnd.size
    });
    
    // Výpis všech prvků v usedRowsStart pro diagnostiku
    usedRowsStart.forEach((list2Row, shiftRow) => {
      logger.info(`usedRowsStart mapping`, { shiftRow, list2Row });
    });
    
    // Výpis všech prvků v usedRowsEnd pro diagnostiku
    usedRowsEnd.forEach((list2Row, shiftRow) => {
      logger.info(`usedRowsEnd mapping`, { shiftRow, list2Row });
    });
    
    return { updatedShifts, entriesFound, exitsFound, reportLines, usedRowsStart, usedRowsEnd, timeWindowHours };
  }

/**
 * Pomocná funkce pro formátování času
 */
function formatTime(date?: Date): string {
  if (!date) return "N/A";
  return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Pomocná funkce pro formátování data a času
 */
function formatDateTime(date: Date, startTime?: Date, endTime?: Date): string {
  const dateStr = date.toLocaleDateString('cs-CZ');
  const startStr = startTime ? startTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const endStr = endTime ? endTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  return `${dateStr} ${startStr}-${endStr}`;
}

/**
  * Generuje HTML report s výsledky aktualizace časů
 * @param result Výsledky aktualizace
 * @returns HTML kód reportu
 */
export function generateTimeUpdateReport(result: TimeUpdateResult): string {
    const { updatedShifts, entriesFound, exitsFound } = result;
    
    let html = `
      <h2>Výsledky aktualizace časů</h2>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr>
          <th>Počet aktualizovaných směn</th>
          <td>${updatedShifts}</td>
        </tr>
        <tr>
          <th>Počet nalezených příchodů</th>
          <td>${entriesFound}</td>
        </tr>
        <tr>
          <th>Počet nalezených odchodů</th>
          <td>${exitsFound}</td>
        </tr>
      </table>
    `;
    
    // Sekce s detailem nalezených čipovacích časů byla odstraněna
    
    // Přidání vysvětlení algoritmu
    html += `
      <div style="margin-top: 15px; padding: 10px;">
        <h3>Jak algoritmus funguje</h3>
        <ol>
          <li>Výpočet časových oken pro hledání čipovacích záznamů (±3 hodiny od plánovaných časů)</li>
          <li>Pro příchody hledáme <strong>nejranější záznam</strong> v časovém okně</li>
          <li>Pro odchody hledáme <strong>nejpozdější záznam</strong> v časovém okně</li>
          <li>Pro navazující směny (do 30 minut po sobě):
            <ul>
              <li>První směna: nastavíme konec na <strong>plánovaný konec</strong>, ale stále hledáme <strong>skutečný příchod</strong></li>
              <li>Druhá směna: nastavíme začátek na <strong>plánovaný začátek</strong>, ale stále hledáme <strong>skutečný odchod</strong></li>
            </ul>
          </li>
        </ol>
      </div>
    `;
    
    return html;
  }