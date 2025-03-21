// modules/podklady/services/excelDataExtractor.ts
import ExcelJS from "exceljs";
import { StructuredLogger } from "./structuredLogger";

const logger = StructuredLogger.getInstance().getComponentLogger("excel-data-extractor");

/**
 * Interface pro data směny
 */
export interface ShiftData {
  rowIndex: number;
  name: string;
  date: Date;
  plannedStart?: Date;
  plannedEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  hasConsecutiveShift?: boolean;
  isSecondPartOfConsecutive?: boolean;
}

/**
 * Interface pro čipovací záznam
 */
export interface ClockRecord {
  rowIndex: number;
  name: string;
  date: Date;
  time: Date;
  combinedDateTime: Date; // Kombinace datumu a času
  place?: string;
  type?: string;
}

/**
 * Funkce pro extrakci dat směn z List1 s korektními indexy sloupců
 */
export function extractShiftsFromList1(
  worksheet: ExcelJS.Worksheet
): ShiftData[] {
  const shifts: ShiftData[] = [];

  // Počáteční řádek dat (indexováno od 1)
  const startRow = 5;

  // Upravené sloupce s daty (indexováno od 1) podle skutečné struktury
  const columns = {
    name: 2, // Sloupec B - jméno
    date: 3, // Sloupec C - datum
    plannedStart: 4, // Sloupec D - plánovaný začátek
    plannedEnd: 5, // Sloupec E - plánovaný konec
    actualStart: 14, // Sloupec N - skutečný začátek
    actualEnd: 15, // Sloupec O - skutečný konec
  };

  // Procházení všech řádků
  let processedRows = 0;
  let skippedRows = 0;

  worksheet.eachRow((row, rowNum) => {
    // Přeskočit hlavičky
    if (rowNum < startRow) return;

    processedRows++;

    // Získání hodnot
    const nameCell = row.getCell(columns.name);
    const dateCell = row.getCell(columns.date);
    const plannedStartCell = row.getCell(columns.plannedStart);
    const plannedEndCell = row.getCell(columns.plannedEnd);
    const actualStartCell = row.getCell(columns.actualStart);
    const actualEndCell = row.getCell(columns.actualEnd);

    // Kontrola, zda máme alespoň jméno a datum
    if (!nameCell.value || !dateCell.value) {
      skippedRows++;
      return;
    }

    // Extrakce jména
    const name = String(nameCell.value).trim();

    // Extrakce a parsování datumu
    let date: Date | null = null;
    if (dateCell.value instanceof Date) {
      date = dateCell.value;
    } else if (typeof dateCell.value === "string") {
      // Předpokládáme formát DD.MM.YYYY
      const dateParts = dateCell.value.split(".");
      if (dateParts.length === 3) {
        date = new Date(
          parseInt(dateParts[2]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[0])
        );
      }
    } else if (typeof dateCell.value === "number") {
      // Excel serial number
      date = new Date((dateCell.value - 25569) * 86400 * 1000);
    }

    if (!date) {
      skippedRows++;
      logger.debug(`Přeskakuji řádek - nelze parsovat datum`, { rowNum, dateValue: dateCell.value });
      return; // Přeskočit řádek, pokud nemůžeme parsovat datum
    }

    // Extrakce a parsování časů
    let plannedStart: Date | null = null;
    let plannedEnd: Date | null = null;
    let actualStart: Date | null = null;
    let actualEnd: Date | null = null;

    // Funkce pro extrakci času z buňky a vytvoření Date objektu
    const extractTime = (cell: ExcelJS.Cell): Date | null => {
      if (!cell.value) return null;

      if (cell.value instanceof Date) {
        return cell.value;
      } else if (typeof cell.value === "string") {
        // Předpokládáme formát HH:MM
        const timeParts = cell.value.split(":");
        if (timeParts.length >= 2) {
          const newDate = new Date(date!);
          newDate.setHours(parseInt(timeParts[0]));
          newDate.setMinutes(parseInt(timeParts[1]));
          return newDate;
        }
      } else if (typeof cell.value === "number") {
        const totalSeconds = cell.value * 86400;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        // Vytvoříme Date objekt s daným datem (obvykle předáno v proměnné date)
        const newDate = new Date(date!);
        newDate.setHours(hours, minutes, 0, 0);

        // Pokud se jedná o čistý čas (výchozí datum Excelu je 1899-12-30),
        // odečteme 1 hodinu, abychom získali očekávaný lokální čas.
        if (newDate.getFullYear() === 1899) {
          newDate.setHours(newDate.getHours() - 1);
        }

        return newDate;
      }

      return null;
    };

    plannedStart = extractTime(plannedStartCell);
    plannedEnd = extractTime(plannedEndCell);
    actualStart = extractTime(actualStartCell);
    actualEnd = extractTime(actualEndCell);

    // Převod null na undefined pro kompatibilitu s typem ShiftData
    shifts.push({
      rowIndex: rowNum,
      name,
      date,
      plannedStart: plannedStart || undefined,
      plannedEnd: plannedEnd || undefined,
      actualStart: actualStart || undefined,
      actualEnd: actualEnd || undefined,
    });
  });

  logger.info(`Extrakce směn z List1 dokončena`, {
    totalRows: processedRows + skippedRows,
    processedRows,
    skippedRows, 
    extractedShifts: shifts.length
  });

  return shifts;
}

/**
 * Funkce pro extrakci čipovacích dat z List2 dle skutečného formátu
 */
export function extractClockRecordsFromList2(
  worksheet: ExcelJS.Worksheet
): ClockRecord[] {
  const records: ClockRecord[] = [];

  // Počáteční řádek dat (indexováno od 1)
  const startRow = 6;

  // Sloupce s daty (indexováno od 1)
  const columns = {
    combinedDateTime: 2, // Sloupec B - datum a čas (15.02.2025 06:35:04)
    name: 3, // Sloupec C - jméno
  };

  // Kontrola, zda List2 existuje a má nějaká data
  if (!worksheet || worksheet.rowCount < startRow) {
    logger.warn(`List2 neexistuje nebo nemá dostatek řádků`, {
      exists: !!worksheet,
      rowCount: worksheet?.rowCount || 0,
      startRow
    });
    return records;
  }

  // Procházení všech řádků
  let processedRows = 0;
  let skippedRows = 0;

  worksheet.eachRow((row, rowNum) => {
    // Přeskočit hlavičky
    if (rowNum < startRow) return;

    processedRows++;

    // Získání hodnot
    const dateTimeCell = row.getCell(columns.combinedDateTime);
    const nameCell = row.getCell(columns.name);

    // Kontrola, zda máme všechna potřebná data
    if (!dateTimeCell.value || !nameCell.value) {
      skippedRows++;
      return;
    }

    // Extrakce jména
    const name = String(nameCell.value).trim();

    // Parsování kombinovaného datumu a času (formát "15.02.2025 06:35:04")
    let dateTimeValue = String(dateTimeCell.value);
    let combinedDateTime: Date | null = null;
    let date: Date | null = null;
    let time: Date | null = null;

    try {
      // Rozdělení na datum a čas
      const parts = dateTimeValue.split(" ");
      if (parts.length >= 2) {
        const datePart = parts[0];
        const timePart = parts[1];

        // Parsování datumu (DD.MM.YYYY)
        const dateParts = datePart.split(".");
        if (dateParts.length === 3) {
          date = new Date(
            parseInt(dateParts[2]), // rok
            parseInt(dateParts[1]) - 1, // měsíc (0-11)
            parseInt(dateParts[0]) // den
          );

          // Parsování času (HH:MM:SS)
          const timeParts = timePart.split(":");
          if (timeParts.length >= 2) {
            // Vytvoření kombinovaného datumu a času
            combinedDateTime = new Date(date);
            combinedDateTime.setHours(parseInt(timeParts[0]));
            combinedDateTime.setMinutes(parseInt(timeParts[1]));

            // Sekundy (pokud jsou k dispozici)
            if (timeParts.length > 2) {
              combinedDateTime.setSeconds(parseInt(timeParts[2]));
            }

            // Vytvoření času (pouze pro účely recordu)
            time = new Date(combinedDateTime);
          }
        }
      }
    } catch (error) {
      logger.error(
        `Chyba při parsování datumu/času`, 
        { 
          rowNum, 
          dateTimeValue,
          error 
        }
      );
    }

    // Kontrola, zda se parsování povedlo
    if (!combinedDateTime || !date || !time) {
      skippedRows++;
      return;
    }

    // Přidání záznamu
    records.push({
      rowIndex: rowNum,
      name,
      date,
      time,
      combinedDateTime,
    });
  });

  logger.info(`Extrakce čipovacích záznamů z List2 dokončena`, {
    totalRows: processedRows + skippedRows,
    processedRows,
    skippedRows, 
    extractedRecords: records.length
  });

  return records;
}

/**
 * Funkce pro zjištění, zda buňka již obsahuje ručně vloženou hodnotu
 * @param cell Buňka k ověření
 * @returns true pokud byla hodnota již ručně vložena
 */
function isManuallyEntered(cell: ExcelJS.Cell): boolean {
  // Zkontrolujeme, zda buňka obsahuje hodnotu
  if (cell.value === null || cell.value === undefined || cell.value === "") {
    return false;
  }
  
  // Zkontrolujeme, zda buňka má nějaké formátování (barva, styl písma, atd.)
  // To může značit, že hodnota byla ručně vložena nebo již dříve zpracována
  return true;
}

/**
 * Funkce pro aktualizaci Excel souboru podle upravených dat - BEZ obarvování List2
 */
export function updateExcelWorkbook(
    workbook: ExcelJS.Workbook,
    shifts: ShiftData[],
    consecutiveShifts: { first: ShiftData; second: ShiftData }[],
    timeUpdateResult?: { usedRowsStart?: Map<number, number>; usedRowsEnd?: Map<number, number> }
  ): void {
    const worksheet = workbook.getWorksheet('List1');
    
    if (!worksheet) {
      logger.error("List1 nebyl nalezen v pracovním sešitu");
      return;
    }
  
    // Diagnostika na začátek funkce pro lepší debugging
    logger.info(`Zahájení aktualizace Excel workbooku`, { 
      shiftsCount: shifts.length, 
      shiftsWithActualStart: shifts.filter(s => s.actualStart).length, 
      shiftsWithActualEnd: shifts.filter(s => s.actualEnd).length,
      consecutiveShiftsCount: consecutiveShifts.length,
      usedRowsStartCount: timeUpdateResult?.usedRowsStart?.size || 0,
      usedRowsEndCount: timeUpdateResult?.usedRowsEnd?.size || 0
    });

    // Sloupce pro aktualizaci
    const columns = {
      actualStart: 14, // Sloupec N - skutečný začátek
      actualEnd: 15,   // Sloupec O - skutečný konec
      plannedStart: 4, // Sloupec D - plánovaný začátek
      plannedEnd: 5    // Sloupec E - plánovaný konec
    };
    
    // Formát času pro Excel
    const timeFormat = 'h:mm';
    
    // Mapa navazujících směn
    const consecutiveMap = new Map<number, { isFirst: boolean; pair: { first: ShiftData; second: ShiftData } }>();
    for (const pair of consecutiveShifts) {
      consecutiveMap.set(pair.first.rowIndex, { isFirst: true, pair });
      consecutiveMap.set(pair.second.rowIndex, { isFirst: false, pair });
    }
    
    // Aktualizace buněk v List1
    let updatedCells = 0;
    let preservedCells = 0;
    let updatedConsecutive = 0;
    let updatedRegular = 0;

    for (const shift of shifts) {
      const row = worksheet.getRow(shift.rowIndex);
      
      // Kontrola, zda je směna součástí navazující dvojice
      const consecutive = consecutiveMap.get(shift.rowIndex);
      
      // Pro navazující směny použijeme speciální logiku
      if (consecutive) {
        if (consecutive.isFirst) {
          // Pro první směnu z páru:
          // 1. Nastavit konec na plánovaný konec (pevný čas)
          const endCell = row.getCell(columns.actualEnd);
          
          // Přístup k původní Excel hodnotě v buňce plánovaného konce
          const originalEndCell = worksheet.getCell(shift.rowIndex, columns.plannedEnd);
          
          // Nastavení přesně té samé hodnoty
          endCell.value = originalEndCell.value;
          endCell.numFmt = timeFormat;
          
          // Hluboká kopie stylu buňky
          endCell.style = JSON.parse(JSON.stringify(endCell.style));
          
          // Nastavení barvy pozadí - Zelené pozadí pro první směnu z navazujícího páru
          endCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF92D050' } // Zelená barva (stejná jako v Excel makru)
          } as ExcelJS.FillPattern;

          updatedCells++;
          
          // 2. Nastavit skutečný čas příchodu (pokud byl nalezen)
          const startCell = row.getCell(columns.actualStart);
          
          // Kontrola, zda buňka už obsahuje hodnotu (ručně vloženou)
          if (isManuallyEntered(startCell)) {
            // Zachováme existující hodnotu i formátování
            logger.info(`Zachovávám již existující hodnotu příchodu pro první směnu navazujícího páru`, {
              rowIndex: shift.rowIndex,
              name: shift.name,
              existingValue: startCell.value
            });
            
            preservedCells++;
          } else if (shift.actualStart) {
            // Pokud buňka neobsahuje hodnotu, ale máme aktualizovaný čas, nastavíme ho
            try {
              // Přímý přístup k času (pouze hodiny a minuty)
              const hours = shift.actualStart.getHours();
              const minutes = shift.actualStart.getMinutes();
              
              // Výpočet Excel reprezentace času (hodiny/24 + minuty/1440)
              const excelTime = hours / 24 + minutes / 1440;
              
              // Nastavení hodnoty a formátu
              startCell.value = excelTime;
              startCell.numFmt = timeFormat;
              
              // Hluboká kopie stylu buňky, aby se zabránilo ovlivnění ostatních buněk
              startCell.style = JSON.parse(JSON.stringify(startCell.style));
              
              // Nastavení barvy pozadí - bílé pozadí pro běžnou směnu
              startCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' } // Bílá barva
              } as ExcelJS.FillPattern;

              updatedCells++;
            } catch (error) {
              logger.error(`Chyba při aktualizaci času příchodu pro první směnu navazujícího páru`, { 
                rowIndex: shift.rowIndex, 
                name: shift.name,
                error 
              });
            }
          } else {
            // Pokud nemáme záznam a buňka neobsahuje hodnotu, nastavíme žluté pozadí
            startCell.value = null; // Nastavíme hodnotu na null místo prázdného řetězce
            
            // Hluboká kopie stylu buňky
            startCell.style = JSON.parse(JSON.stringify(startCell.style));
            
            startCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFF00' } // Žluté pozadí pro chybějící hodnoty
            } as ExcelJS.FillPattern;

            updatedCells++;
          }
          
          updatedConsecutive++;
        } else {
          // Pro druhou směnu z páru:
          // 1. Nastavit začátek na plánovaný začátek (pevný čas)
          const startCell = row.getCell(columns.actualStart);
          
          // Přístup k původní Excel hodnotě v buňce plánovaného začátku
          const originalStartCell = worksheet.getCell(shift.rowIndex, columns.plannedStart);
          
          // Nastavení přesně té samé hodnoty
          startCell.value = originalStartCell.value;
          startCell.numFmt = timeFormat;
          
          // Hluboká kopie stylu buňky
          startCell.style = JSON.parse(JSON.stringify(startCell.style));
          
          // Nastavení barvy pozadí - Zelené pozadí pro druhou směnu z navazujícího páru
          startCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF92D050' } // Zelená barva (stejná jako v Excel makru)
          } as ExcelJS.FillPattern;

          updatedCells++;
          
          // 2. Nastavit skutečný čas odchodu (pokud byl nalezen)
          const endCell = row.getCell(columns.actualEnd);
          
          // Kontrola, zda buňka už obsahuje hodnotu (ručně vloženou)
          if (isManuallyEntered(endCell)) {
            // Zachováme existující hodnotu i formátování
            logger.info(`Zachovávám již existující hodnotu odchodu pro druhou směnu navazujícího páru`, {
              rowIndex: shift.rowIndex,
              name: shift.name,
              existingValue: endCell.value
            });
            
            preservedCells++;
          } else if (shift.actualEnd) {
            // Pokud buňka neobsahuje hodnotu, ale máme aktualizovaný čas, nastavíme ho
            try {
              // Přímý přístup k času (pouze hodiny a minuty)
              const hours = shift.actualEnd.getHours();
              const minutes = shift.actualEnd.getMinutes();
              
              // Výpočet Excel reprezentace času (hodiny/24 + minuty/1440)
              const excelTime = hours / 24 + minutes / 1440;
              
              // Nastavení hodnoty a formátu
              endCell.value = excelTime;
              endCell.numFmt = timeFormat;
              
              // Hluboká kopie stylu buňky
              endCell.style = JSON.parse(JSON.stringify(endCell.style));
              
              // Nastavení barvy pozadí - bílé pozadí
              endCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' } // Bílá barva
              } as ExcelJS.FillPattern;

              updatedCells++;
            } catch (error) {
              logger.error(`Chyba při aktualizaci času odchodu pro druhou směnu navazujícího páru`, { 
                rowIndex: shift.rowIndex,
                name: shift.name,
                error 
              });
            }
          } else {
            // Pokud nemáme záznam a buňka neobsahuje hodnotu, nastavíme žluté pozadí
            endCell.value = null; // Nastavíme hodnotu na null místo prázdného řetězce
            
            // Hluboká kopie stylu buňky
            endCell.style = JSON.parse(JSON.stringify(endCell.style));
            
            endCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFF00' } // Žluté pozadí pro chybějící hodnoty
            } as ExcelJS.FillPattern;

            updatedCells++;
          }
          
          updatedConsecutive++;
        }
      } else {
        // Standardní logika pro běžné směny
        // Aktualizace času příchodu (sloupec N)
        const startCell = row.getCell(columns.actualStart);
          
        // Kontrola, zda buňka už obsahuje hodnotu (ručně vloženou)
        if (isManuallyEntered(startCell)) {
          // Zachováme existující hodnotu i formátování
          logger.info(`Zachovávám již existující hodnotu příchodu`, {
            rowIndex: shift.rowIndex,
            name: shift.name,
            existingValue: startCell.value
          });
          
          preservedCells++;
        } else if (shift.actualStart) {
          try {
            // Přímý přístup k času (pouze hodiny a minuty)
            const hours = shift.actualStart.getHours();
            const minutes = shift.actualStart.getMinutes();
            
            // Výpočet Excel reprezentace času (hodiny/24 + minuty/1440)
            const excelTime = hours / 24 + minutes / 1440;
            
            // Nastavení hodnoty a formátu
            startCell.value = excelTime;
            startCell.numFmt = timeFormat;
            
            // Hluboká kopie stylu buňky, aby se zabránilo ovlivnění ostatních buněk
            startCell.style = JSON.parse(JSON.stringify(startCell.style));
            
            // Nastavení barvy pozadí - bílé pozadí pro běžnou směnu
            startCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' } // Bílá barva
            } as ExcelJS.FillPattern;

            updatedCells++;
          } catch (error) {
            logger.error(`Chyba při aktualizaci času příchodu`, { 
              rowIndex: shift.rowIndex,
              name: shift.name,
              error 
            });
          }
        } else {
          // Pokud nemáme záznam a buňka neobsahuje hodnotu, nastavíme žluté pozadí
          startCell.value = null; // Nastavíme hodnotu na null místo prázdného řetězce
          
          // Hluboká kopie stylu buňky
          startCell.style = JSON.parse(JSON.stringify(startCell.style));
          
          startCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' } // Žluté pozadí pro chybějící hodnoty
          } as ExcelJS.FillPattern;

          updatedCells++;
        }
        
        // Aktualizace času odchodu (sloupec O)
        const endCell = row.getCell(columns.actualEnd);
          
        // Kontrola, zda buňka už obsahuje hodnotu (ručně vloženou)
        if (isManuallyEntered(endCell)) {
          // Zachováme existující hodnotu i formátování
          logger.info(`Zachovávám již existující hodnotu odchodu`, {
            rowIndex: shift.rowIndex,
            name: shift.name,
            existingValue: endCell.value
          });
          
          preservedCells++;
        } else if (shift.actualEnd) {
          try {
            // Přímý přístup k času (pouze hodiny a minuty)
            const hours = shift.actualEnd.getHours();
            const minutes = shift.actualEnd.getMinutes();
            
            // Výpočet Excel reprezentace času (hodiny/24 + minuty/1440)
            const excelTime = hours / 24 + minutes / 1440;
            
            // Nastavení hodnoty a formátu
            endCell.value = excelTime;
            endCell.numFmt = timeFormat;
            
            // Hluboká kopie stylu buňky
            endCell.style = JSON.parse(JSON.stringify(endCell.style));
            
            // Nastavení barvy pozadí - bílé pozadí pro běžnou směnu
            endCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' } // Bílá barva
            } as ExcelJS.FillPattern;

            updatedCells++;
          } catch (error) {
            logger.error(`Chyba při aktualizaci času odchodu`, { 
              rowIndex: shift.rowIndex,
              name: shift.name,
              error 
            });
          }
        } else {
          // Pokud nemáme záznam a buňka neobsahuje hodnotu, nastavíme žluté pozadí
          endCell.value = null; // Nastavíme hodnotu na null místo prázdného řetězce
          
          // Hluboká kopie stylu buňky
          endCell.style = JSON.parse(JSON.stringify(endCell.style));
          
          endCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' } // Žluté pozadí pro chybějící hodnoty
          } as ExcelJS.FillPattern;

          updatedCells++;
        }

        updatedRegular++;
      }
    }
    
    // Informativní log o výsledku aktualizace
    logger.info("Aktualizace Excel workbooku dokončena", {
      updatedCells,
      preservedCells,
      updatedConsecutiveShifts: updatedConsecutive,
      updatedRegularShifts: updatedRegular,
      List2NotProcessed: true
    });
  }