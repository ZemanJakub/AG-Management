// modules/podklady/services/excelDataExtractor.ts
import ExcelJS from "exceljs";
import { createLogger } from "./logger";

const logger = createLogger("excel-data-extractor");

// Interface pro data směny
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

// Interface pro čipovací záznam
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
 * Funkce pro extrakci dat směn z List1 s rozšířenou diagnostikou
 */
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
        `Chyba při parsování datumu/času na řádku ${rowNum}: ${error}`
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

  return records;
}
/**
 * Funkce pro aktualizaci Excel souboru podle upravených dat
 */
/**
 * Funkce pro aktualizaci Excel souboru podle upravených dat
 */
/**
 * Funkce pro aktualizaci Excel souboru podle upravených dat
 */
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
    logger.info(`updateExcelWorkbook: počet směn: ${shifts.length}, z toho s actualStart: ${shifts.filter(s => s.actualStart).length}, s actualEnd: ${shifts.filter(s => s.actualEnd).length}`);
    if (timeUpdateResult) {
      logger.info(`timeUpdateResult: usedRowsStart: ${timeUpdateResult.usedRowsStart?.size || 0}, usedRowsEnd: ${timeUpdateResult.usedRowsEnd?.size || 0}`);
    } else {
      logger.warn(`timeUpdateResult není k dispozici!`);
    }

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
          
          // 2. Nastavit skutečný čas příchodu (pokud byl nalezen)
          if (shift.actualStart) {
            const startCell = row.getCell(columns.actualStart);
            
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
            } catch (error) {
              logger.error(`Chyba při aktualizaci času příchodu pro první směnu navazujícího páru (řádek ${shift.rowIndex}): ${error}`);
            }
          } else {
            // Pokud nemáme záznam, nastavíme žluté pozadí
            const startCell = row.getCell(columns.actualStart);
            startCell.value = ""; // Vyčistíme hodnotu
            
            // Hluboká kopie stylu buňky
            startCell.style = JSON.parse(JSON.stringify(startCell.style));
            
            startCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFF00' } // Žluté pozadí pro chybějící hodnoty
            } as ExcelJS.FillPattern;
          }
          
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
          
          // 2. Nastavit skutečný čas odchodu (pokud byl nalezen)
          if (shift.actualEnd) {
            const endCell = row.getCell(columns.actualEnd);
            
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
            } catch (error) {
              logger.error(`Chyba při aktualizaci času odchodu pro druhou směnu navazujícího páru (řádek ${shift.rowIndex}): ${error}`);
            }
          } else {
            // Pokud nemáme záznam, nastavíme žluté pozadí
            const endCell = row.getCell(columns.actualEnd);
            endCell.value = ""; // Vyčistíme hodnotu
            
            // Hluboká kopie stylu buňky
            endCell.style = JSON.parse(JSON.stringify(endCell.style));
            
            endCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFF00' } // Žluté pozadí pro chybějící hodnoty
            } as ExcelJS.FillPattern;
          }
        }
      } else {
        // Standardní logika pro běžné směny
        // Aktualizace času příchodu (sloupec N)
        if (shift.actualStart) {
          const cell = row.getCell(columns.actualStart);
          
          try {
            // Přímý přístup k času (pouze hodiny a minuty)
            const hours = shift.actualStart.getHours();
            const minutes = shift.actualStart.getMinutes();
            
            // Výpočet Excel reprezentace času (hodiny/24 + minuty/1440)
            const excelTime = hours / 24 + minutes / 1440;
            
            // Nastavení hodnoty a formátu
            cell.value = excelTime;
            cell.numFmt = timeFormat;
            
            // Hluboká kopie stylu buňky, aby se zabránilo ovlivnění ostatních buněk
            cell.style = JSON.parse(JSON.stringify(cell.style));
            
            // Nastavení barvy pozadí - bílé pozadí pro běžnou směnu
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' } // Bílá barva
            } as ExcelJS.FillPattern;
          } catch (error) {
            logger.error(`Chyba při aktualizaci času příchodu (řádek ${shift.rowIndex}): ${error}`);
          }
        } else {
          // Pokud nemáme záznam, nastavíme žluté pozadí
          const cell = row.getCell(columns.actualStart);
          cell.value = ""; // Vyčistíme hodnotu
          
          // Hluboká kopie stylu buňky
          cell.style = JSON.parse(JSON.stringify(cell.style));
          
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' } // Žluté pozadí pro chybějící hodnoty
          } as ExcelJS.FillPattern;
        }
        
        // Aktualizace času odchodu (sloupec O)
        if (shift.actualEnd) {
          const cell = row.getCell(columns.actualEnd);
          
          try {
            // Přímý přístup k času (pouze hodiny a minuty)
            const hours = shift.actualEnd.getHours();
            const minutes = shift.actualEnd.getMinutes();
            
            // Výpočet Excel reprezentace času (hodiny/24 + minuty/1440)
            const excelTime = hours / 24 + minutes / 1440;
            
            // Nastavení hodnoty a formátu
            cell.value = excelTime;
            cell.numFmt = timeFormat;
            
            // Hluboká kopie stylu buňky
            cell.style = JSON.parse(JSON.stringify(cell.style));
            
            // Nastavení barvy pozadí - bílé pozadí pro běžnou směnu
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' } // Bílá barva
            } as ExcelJS.FillPattern;
          } catch (error) {
            logger.error(`Chyba při aktualizaci času odchodu (řádek ${shift.rowIndex}): ${error}`);
          }
        } else {
          // Pokud nemáme záznam, nastavíme žluté pozadí
          const cell = row.getCell(columns.actualEnd);
          cell.value = ""; // Vyčistíme hodnotu
          
          // Hluboká kopie stylu buňky
          cell.style = JSON.parse(JSON.stringify(cell.style));
          
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' } // Žluté pozadí pro chybějící hodnoty
          } as ExcelJS.FillPattern;
        }
      }
    }
    
    // Odebrali jsme celou část pro zpracování List2
    
    // Pouze informativní log, že List2 nebude obarvován
    if (timeUpdateResult) {
      logger.info("Obarvování buněk v List2 bylo deaktivováno.");
    }
  }