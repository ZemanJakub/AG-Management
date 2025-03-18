// app/actions/podklady/enhancedSheetProcessor.ts
"use server";

import ExcelJS from "exceljs";
import { read, utils, writeFile } from "xlsx";
import path from "path";
import { createLogger } from "@/modules/podklady/services/logger";
import fs from "fs/promises";

const logger = createLogger("enhanced-sheet-processor");

type ProcessSheetResult = {
  success: boolean;
  message?: string;
  error?: string;
  newSheetName?: string;
  dataAdded?: number; // Počet přidaných záznamů
};

/**
 * Funkce pro zpracování Excel souboru - zjištění existence listu a přidání dat
 * @param targetFileName Název cílového souboru (ve složce public/downloads)
 * @param sourceData Data k přidání do souboru (záznamy z Avarisu)
 * @returns Výsledek operace
 */
export async function processExcelSheet(
  targetFileName: string,
  sourceData: any[]
): Promise<ProcessSheetResult> {
  try {
    logger.info(
      `Zpracovávám Excel soubor ${targetFileName} pro přidání dat z Avarisu`
    );

    // Cesta k souboru
    const targetFilePath = path.join(
      process.cwd(),
      "public",
      "downloads",
      targetFileName
    );

    // Ověřit existenci souboru
    try {
      await fs.access(targetFilePath);
      logger.info(`Cílový soubor existuje: ${targetFilePath}`);
    } catch (error) {
      logger.error(`Cílový soubor neexistuje: ${targetFilePath}`);
      return {
        success: false,
        error: `Cílový soubor neexistuje: ${targetFileName}`,
      };
    }

    // Načtení cílového souboru pomocí ExcelJS pro zachování formátování a vzorců
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(targetFilePath);

    // Kontrola existence List1 a jeho zachování
    const list1 = workbook.getWorksheet('List1');
    if (!list1) {
      return {
        success: false,
        error: "Soubor neobsahuje list 'List1', který je nezbytný pro zpracování.",
      };
    }

    // Kontrola existence List2 a zjištění, zda obsahuje data
    let list2 = workbook.getWorksheet('List2');
    let existingData = false;
    let lastTimestamp: Date | null = null;
    
    if (list2) {
      // Procházení dat v List2 a zjištění posledního časového záznamu
      let rowCount = 0;
      list2.eachRow((row, rowNumber) => {
        rowCount++;
        // Předpokládáme, že časové údaje jsou ve sloupci B a začínají od řádku 6
        if (rowNumber >= 6) {
          const timestampCell = row.getCell(2); // Sloupec B
          if (timestampCell.value) {
            try {
              // Pokus o převod hodnoty na datum
              let timestamp: Date | null = null;
              if (typeof timestampCell.value === 'string') {
                // Formát může být "DD.MM.YYYY HH:MM:SS"
                const parts = timestampCell.value.split(' ');
                if (parts.length > 1) {
                  const dateParts = parts[0].split('.');
                  const timeParts = parts[1].split(':');
                  
                  if (dateParts.length === 3 && timeParts.length >= 2) {
                    timestamp = new Date(
                      parseInt(dateParts[2]),  // rok
                      parseInt(dateParts[1]) - 1,  // měsíc (0-11)
                      parseInt(dateParts[0]),  // den
                      parseInt(timeParts[0]),  // hodina
                      parseInt(timeParts[1]),  // minuta
                      timeParts.length > 2 ? parseInt(timeParts[2]) : 0  // sekunda
                    );
                  }
                }
              } else if (timestampCell.value instanceof Date) {
                timestamp = timestampCell.value;
              }
              
              if (timestamp && (!lastTimestamp || timestamp > lastTimestamp)) {
                lastTimestamp = timestamp;
              }
            } catch (e) {
              logger.warn(`Chyba při zpracování časového údaje v řádku ${rowNumber}: ${e}`);
            }
          }
        }
      });
      
      existingData = rowCount > 5; // Pokud je více než 5 řádků, považujeme to za existující data
      logger.info(`List2 existuje, obsahuje ${rowCount} řádků, poslední časový údaj: ${lastTimestamp}`);
    } else {
      // List2 neexistuje, vytvoříme ho
      list2 = workbook.addWorksheet('List2');
      logger.info(`List2 byl vytvořen, protože v souboru neexistoval`);
    }

    // Filtrace dat, pokud máme poslední časový údaj
    let filteredData = sourceData;
    if (lastTimestamp) {
      filteredData = sourceData.filter(record => {
        // Převod časového údaje v záznamu (předpokládáme, že je ve sloupci B)
        try {
          const recordTimestamp = parseTimestamp(record[1]); // index 1 odpovídá sloupci B
          if (lastTimestamp && lastTimestamp!==null)
          return recordTimestamp > lastTimestamp;
        } catch (e) {
          logger.warn(`Chyba při filtrování záznamu podle času: ${e}`);
          return false;
        }
      });
      
      logger.info(`Filtrováno ${filteredData.length} nových záznamů z celkových ${sourceData.length}`);
    }

    // Pokud neexistují data, nastavíme hlavičky a formátování
    if (!existingData) {
      // Přidáme instrukce do buňky A1
      list2.getCell("A1").value = "Data z Avarisu";
      list2.getCell("A2").value = "Pro zpracování spusťte makro v List1";
      list2.getCell("A3").value = `Datum generování: ${new Date().toLocaleString("cs-CZ")}`;

      // Přidáme hlavičky
      list2.getCell("A5").value = "Den";
      list2.getCell("B5").value = "Datum";
      list2.getCell("C5").value = "Jméno";
      list2.getCell("D5").value = "Čas (formát)";

      // ====== FORMÁTOVÁNÍ SLOUPCŮ A BUNĚK ======
      logger.info("Nastavuji vlastnosti sloupců a formátování...");
      
      // Nastavení šířky sloupců
      const columnWidths = [12, 15, 30, 10];
      for (let i = 1; i <= 4; i++) {
        const column = list2.getColumn(i);
        column.width = columnWidths[i-1];
      }

      // Formátování hlaviček (řádek 5)
      for (let i = 1; i <= 4; i++) {
        const headerCell = list2.getCell(5, i);
        headerCell.font = { bold: true };
        headerCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        headerCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        headerCell.alignment = { horizontal: 'center' };
      }

      // Zmrazení horních 5 řádků
      list2.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 5,
          topLeftCell: 'A6',
          activeCell: 'A6'
        }
      ];
    }

    // Přidání nových dat do listu
    const startRow = existingData ? list2.rowCount + 1 : 6;
    let rowsAdded = 0;

    filteredData.forEach((rowData, index) => {
      const currentRow = startRow + index;
      const row = list2.getRow(currentRow);
      
      // Nastavení hodnot pro sloupce A, B, C
      for (let colIndex = 0; colIndex < 3; colIndex++) {
        const cellValue = rowData[colIndex];
        if (cellValue !== null && cellValue !== undefined) {
          row.getCell(colIndex + 1).value = cellValue;
        }
      }

      // Zpracování časového údaje pro sloupec D
      const timeValue = rowData[1]; // index 1 odpovídá sloupci B (časový údaj)
      if (timeValue) {
        const timeStr = String(timeValue);
        // Extrakce času z formátu "04.02.2025 18:22:47"
        if (timeStr && timeStr.includes(" ")) {
          try {
            // Oddělení času od datumu
            const parts = timeStr.split(" ");
            if (parts.length > 1) {
              const timePart = parts[1]; // část "18:22:47"
              const timeParts = timePart.split(":");
              
              if (timeParts.length >= 2) {
                const hours = parseInt(timeParts[0], 10);
                const minutes = parseInt(timeParts[1], 10);
                const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
      
                // Výpočet excel časové hodnoty (hodiny/24 + minuty/1440 + sekundy/86400)
                const excelTime = hours / 24 + minutes / 1440 + seconds / 86400;
      
                // Nastavíme hodnotu a formát
                const cell = row.getCell(4); // Sloupec D
                cell.value = excelTime;
                cell.numFmt = "h:mm"; // Formát zobrazení "18:22" (přestože hodnota obsahuje i sekundy)
              }
            }
          } catch (error) {
            logger.error(`Chyba při zpracování času ${timeStr}: ${error}`);
          }
        }
      }

      // Přidání ohraničení pro buňky
      for (let colIndex = 1; colIndex <= 4; colIndex++) {
        const cell = row.getCell(colIndex);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }

      rowsAdded++;
    });

    // Uložení změn do cílového souboru
    logger.info(`Ukládám změny do souboru: ${targetFilePath}`);
    await workbook.xlsx.writeFile(targetFilePath);

    return {
      success: true,
      message: `${rowsAdded} záznamů bylo úspěšně přidáno do listu 'List2'.`,
      newSheetName: 'List2',
      dataAdded: rowsAdded
    };
  } catch (error) {
    logger.error(`Chyba při zpracování Excel souboru: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neznámá chyba",
    };
  }
}

/**
 * Pomocná funkce pro převod časového údaje na datum
 */
function parseTimestamp(timeStr: string): Date {
  if (!timeStr) throw new Error("Prázdný časový údaj");
  
  // Formát může být "DD.MM.YYYY HH:MM:SS" nebo jen "HH:MM:SS"
  const parts = timeStr.split(' ');
  
  if (parts.length > 1) {
    // Formát "DD.MM.YYYY HH:MM:SS"
    const dateParts = parts[0].split('.');
    const timeParts = parts[1].split(':');
    
    if (dateParts.length === 3 && timeParts.length >= 2) {
      return new Date(
        parseInt(dateParts[2]),  // rok
        parseInt(dateParts[1]) - 1,  // měsíc (0-11)
        parseInt(dateParts[0]),  // den
        parseInt(timeParts[0]),  // hodina
        parseInt(timeParts[1]),  // minuta
        timeParts.length > 2 ? parseInt(timeParts[2]) : 0  // sekunda
      );
    }
  } else if (parts[0].includes(':')) {
    // Formát je jen "HH:MM:SS", použijeme aktuální datum
    const timeParts = parts[0].split(':');
    
    if (timeParts.length >= 2) {
      const now = new Date();
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        parseInt(timeParts[0]),  // hodina
        parseInt(timeParts[1]),  // minuta
        timeParts.length > 2 ? parseInt(timeParts[2]) : 0  // sekunda
      );
    }
  }
  
  throw new Error(`Nepodporovaný formát časového údaje: ${timeStr}`);
}