// app/actions/avaris/copySheet.ts
"use server";

import ExcelJS from "exceljs";
import path from "path";
import { StructuredLogger } from "@/modules/podklady/services/structuredLogger";
import fs from "fs/promises";

// Inicializace StructuredLogger
const logger = StructuredLogger.getInstance().getComponentLogger("excel-utils");

type CopySheetResult = {
  success: boolean;
  message?: string;
  error?: string;
  newSheetName?: string; // Přidáno pro návratovou hodnotu s názvem nového listu
};

/**
 * Funkce pro vytvoření nového listu s daty z Avarisu v Excel souboru
 * @param sourceFileName Název zdrojového souboru (ve složce public/downloads)
 * @param targetFileName Název cílového souboru (ve složce public/downloads)
 * @returns Výsledek operace včetně názvu nového listu
 */
export async function copySheet(
  sourceFileName: string,
  targetFileName: string
): Promise<CopySheetResult> {
  // Generujeme korelační ID pro sledování této operace
  const correlationId = `copy_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  logger.setCorrelationId(correlationId);

  try {
    logger.info(
      `Přidávám data z ${sourceFileName} do souboru ${targetFileName} jako nový list`, {
        sourceFile: sourceFileName,
        targetFile: targetFileName
      }
    );

    // Cesty k souborům
    const sourceFilePath = path.join(
      process.cwd(),
      "public",
      "downloads",
      sourceFileName
    );
    const targetFilePath = path.join(
      process.cwd(),
      "public",
      "downloads",
      targetFileName
    );

    // Ověřit existenci souborů
    try {
      await fs.access(sourceFilePath);
      logger.info(`Zdrojový soubor existuje: ${sourceFilePath}`);
    } catch (error) {
      logger.error(`Zdrojový soubor neexistuje: ${sourceFilePath}`, {
        error: error instanceof Error ? error.message : 'Neznámá chyba'
      });
      return {
        success: false,
        error: `Zdrojový soubor neexistuje: ${sourceFileName}`,
      };
    }

    try {
      await fs.access(targetFilePath);
      logger.info(`Cílový soubor existuje: ${targetFilePath}`);
    } catch (error) {
      logger.error(`Cílový soubor neexistuje: ${targetFilePath}`, {
        error: error instanceof Error ? error.message : 'Neznámá chyba'
      });
      return {
        success: false,
        error: `Cílový soubor neexistuje: ${targetFileName}`,
      };
    }

    // Načtení zdrojového souboru
    logger.info(`Načítám zdrojový soubor: ${sourceFilePath}`);
    const sourceWorkbook = new ExcelJS.Workbook();
    await sourceWorkbook.xlsx.readFile(sourceFilePath);

    // Získání prvního listu ze zdrojového souboru
    let sourceSheet = sourceWorkbook.getWorksheet('List2');
    if (!sourceSheet) {
      logger.warn(`List2 nenalezen ve zdrojovém souboru, hledám jiný list...`);
      // Pokud List2 neexistuje, zkusíme první dostupný list
      sourceSheet = sourceWorkbook.worksheets[0];
    }
    if (!sourceSheet) {
      logger.error(`Zdrojový soubor neobsahuje žádné listy`);
      throw new Error(`Zdrojový soubor neobsahuje žádné listy`);
    }

    // Načtení cílového souboru
    logger.info(`Načítám cílový soubor: ${targetFilePath}`);
    const targetWorkbook = new ExcelJS.Workbook();
    await targetWorkbook.xlsx.readFile(targetFilePath);

    // Vytvoříme unikátní název pro nový list
    const newSheetName = `List4`;

    // Zkontrolujeme, zda již neexistuje list s tímto názvem, a pokud ano, smažeme ho
    const existingSheet = targetWorkbook.getWorksheet(newSheetName);
    if (existingSheet) {
      logger.info(`List ${newSheetName} již existuje, odstraňuji...`);
      targetWorkbook.removeWorksheet(existingSheet.id);
    }

    // Vytvoříme zcela nový list
    const newSheet = targetWorkbook.addWorksheet(newSheetName);

    // Přidáme instrukce do buňky A1
    newSheet.getCell("A1").value = "Data z Avarisu";
    newSheet.getCell("A2").value = "Pro zpracování spusťte makro v List1";
    newSheet.getCell("A3").value =
      `Datum generování: ${new Date().toLocaleString("cs-CZ")}`;

    // Přidáme hlavičky
    newSheet.getCell("A5").value = "Den";
    newSheet.getCell("B5").value = "Datum";
    newSheet.getCell("C5").value = "Jméno";
    newSheet.getCell("D5").value = "Čas (formát)";

    // Log struktury zdrojového sešitu
    logger.info(`Zdrojový sešit má ${sourceSheet.rowCount} řádků a ${sourceSheet.columnCount} sloupců`);
    logger.info(`Struktura zdrojového sešitu:`);
    
    // Vypíšeme prvních několik řádků zdrojového sešitu pro diagnózu
    for (let i = 1; i <= Math.min(10, sourceSheet.rowCount); i++) {
      const row = sourceSheet.getRow(i);
      const values = [];
      for (let j = 1; j <= Math.min(5, sourceSheet.columnCount); j++) {
        values.push(row.getCell(j).value);
      }
      logger.debug(`Řádek ${i}: ${JSON.stringify(values)}`);
    }

    // Načteme data ze zdrojového listu - vylepšená logika
    const sourceData: any[][] = [];
    let headerFound = false;
    let dataStartRow = -1;

    // Nejprve najdeme řádek s hlavičkami dat
    for (let rowIndex = 1; rowIndex <= sourceSheet.rowCount; rowIndex++) {
      const row = sourceSheet.getRow(rowIndex);
      
      // Hledáme řádek, který obsahuje typické hlavičky jako "Čas" nebo "Místo"
      const cellValues = [];
      for (let colIndex = 1; colIndex <= Math.min(10, sourceSheet.columnCount); colIndex++) {
        const cellValue = String(row.getCell(colIndex).value || '');
        cellValues.push(cellValue);
        
        if (cellValue.includes("Čas") || cellValue.includes("Místo") || 
            cellValue.includes("Den")) {
          headerFound = true;
          dataStartRow = rowIndex + 1; // Data začínají na následujícím řádku
          logger.info(`Nalezen řádek s hlavičkami: ${rowIndex}, data začínají od řádku ${dataStartRow}`, {
            headers: cellValues
          });
          break;
        }
      }
      
      if (headerFound) break;
    }

    // Pokud jsme nenašli hlavičky, zkusíme použít nějakou výchozí hodnotu
    if (!headerFound) {
      logger.warn("Nepodařilo se najít řádek s hlavičkami, používám výchozí hodnotu (řádek 6)");
      dataStartRow = 6;
    }

    // Identifikace sloupců s potřebnými daty
    let dateColumnIndex = -1;
    let timeColumnIndex = -1;
    let placeColumnIndex = -1;
    
    if (headerFound) {
      const headerRow = sourceSheet.getRow(dataStartRow - 1);
      for (let colIndex = 1; colIndex <= sourceSheet.columnCount; colIndex++) {
        const cellValue = String(headerRow.getCell(colIndex).value || '').toLowerCase();
        
        if (cellValue.includes("den")) {
          dateColumnIndex = colIndex;
        } else if (cellValue.includes("čas")) {
          timeColumnIndex = colIndex;
        } else if (cellValue.includes("místo")) {
          placeColumnIndex = colIndex;
        }
      }
      
      logger.info(`Identifikované sloupce - Den: ${dateColumnIndex}, Čas: ${timeColumnIndex}, Místo: ${placeColumnIndex}`);
    }
    
    // Pokud se nepodařilo identifikovat sloupce, použijeme výchozí indexy
    if (dateColumnIndex === -1) dateColumnIndex = 1;
    if (timeColumnIndex === -1) timeColumnIndex = 2;
    if (placeColumnIndex === -1) placeColumnIndex = 3;
    
    // Nyní načteme skutečná data od zjištěného řádku
    let totalRows = 0;
    
    for (let rowIndex = dataStartRow; rowIndex <= sourceSheet.rowCount; rowIndex++) {
      const row = sourceSheet.getRow(rowIndex);
      
      // Kontrola, zda řádek obsahuje data (alespoň jedno pole není prázdné)
      let hasData = false;
      for (let colIndex = 1; colIndex <= sourceSheet.columnCount; colIndex++) {
        if (row.getCell(colIndex).value) {
          hasData = true;
          break;
        }
      }
      
      if (!hasData) continue; // Přeskočíme prázdné řádky
      
      totalRows++;
      
      // Získáme hodnoty ze sloupců
      const dayValue = row.getCell(dateColumnIndex).value;
      const timeValue = row.getCell(timeColumnIndex).value;
      const placeValue = row.getCell(placeColumnIndex).value;
      
      // Přidáme data jen pokud máme alespoň jednu hodnotu
      if (timeValue || placeValue) {
        sourceData.push([dayValue, timeValue, placeValue]);
        // Debug log pro prvních několik řádků
        if (sourceData.length <= 5) {
          logger.debug(`Přidávám řádek dat: Den=${dayValue}, Čas=${timeValue}, Místo=${placeValue}`);
        }
      }
    }

    logger.info(`Celkem nalezeno a zpracováno ${totalRows} řádků dat`, {
      totalRows,
      extractedRows: sourceData.length
    });
    if (sourceData.length > 0) {
      logger.debug(`První řádek dat: ${JSON.stringify(sourceData[0])}`);
      if (sourceData.length > 1) {
        logger.debug(`Poslední řádek dat: ${JSON.stringify(sourceData[sourceData.length - 1])}`);
      }
    } else {
      logger.warn(`Žádná data nebyla nalezena!`);
    }

    // Zapíšeme data do nového listu
    sourceData.forEach((rowData, rowIndex) => {
      const targetRow = rowIndex + 6; // Začínáme od řádku 6 (pod hlavičkou)
      
      // Mapování sloupců ze zdrojových dat do cílového listu
      for (let colIndex = 0; colIndex < rowData.length; colIndex++) {
        const cellValue = rowData[colIndex];
        if (cellValue !== null && cellValue !== undefined) {
          newSheet.getCell(targetRow, colIndex + 1).value = cellValue;
        }
      }

      // Pokud máme hodnotu času (druhý sloupec), vytvoříme také formátovaný čas ve sloupci D
      const timeValue = rowData[1]; // Index 1 odpovídá sloupci s časem
      if (timeValue) {
        const timeStr = String(timeValue);
        if (timeStr && timeStr.includes(":")) {
          // Vytvoříme časovou hodnotu pro Excel
          try {
            const timeParts = timeStr.split(":");
            if (timeParts.length >= 2) {
              const hours = parseInt(timeParts[0], 10);
              const minutes = parseInt(timeParts[1], 10);
              const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;

              // Výpočet excel časové hodnoty (hodiny/24 + minuty/1440 + sekundy/86400)
              const excelTime = hours / 24 + minutes / 1440 + seconds / 86400;

              // Nastavíme hodnotu a formát
              const cell = newSheet.getCell(targetRow, 4); // Sloupec D (index 4)
              cell.value = excelTime;
              cell.numFmt = "h:mm"; // Formát "0:00"
            }
          } catch (error) {
            logger.error(`Chyba při zpracování času ${timeStr}: ${error}`, {
              timeString: timeStr,
              error: error instanceof Error ? error.message : 'Neznámá chyba'
            });
          }
        }
      }
    });

    // ====== FORMÁTOVÁNÍ SLOUPCŮ A BUNĚK ======
    logger.info("Nastavuji vlastnosti sloupců a formátování...");
    
    // KROK 1: Nastavení šířky sloupců podle hodnot z csvProcessor.ts
    const columnWidths = [12, 15, 30, 10]; // odpovídá wch hodnotám

    for (let i = 1; i <= 4; i++) {
      const column = newSheet.getColumn(i);
      column.width = columnWidths[i-1];
    }

    // KROK 2: Formátování hlaviček (řádek 5)
    for (let i = 1; i <= 4; i++) {
      const headerCell = newSheet.getCell(5, i);
      headerCell.font = { bold: true };
      headerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' } // Světle šedé pozadí, jako v csvProcessor.ts
      };
      headerCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      headerCell.alignment = { horizontal: 'center' };
    }
    
    // KROK 3: Ujistit se, že všechny buňky ve sloupci D mají formát času
    for (let rowIndex = 6; rowIndex <= 6 + sourceData.length; rowIndex++) {
      const cell = newSheet.getCell(`D${rowIndex}`);
      if (cell.value) {
        cell.numFmt = "h:mm"; // Formát "0:00"
      }
    }
    
    // KROK 4: Přidat ohraničení pro datové buňky
    for (let rowIndex = 6; rowIndex <= 6 + sourceData.length; rowIndex++) {
      for (let colIndex = 1; colIndex <= 4; colIndex++) {
        const cell = newSheet.getCell(rowIndex, colIndex);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }

    // KROK 5: Nastavení vlastností celého listu pro lepší čitelnost
    newSheet.properties.defaultRowHeight = 15; // Výchozí výška řádku

    // KROK 6: Zmrazení horních 5 řádků (aby hlavičky zůstaly vždy viditelné při scrollování)
    newSheet.views = [
      {
        state: 'frozen',
        xSplit: 0,
        ySplit: 5,
        topLeftCell: 'A6',
        activeCell: 'A6'
      }
    ];

    // Pro kontrolu vypíšeme nastavené šířky sloupců
    logger.debug(`Nastavené šířky sloupců: A=${newSheet.getColumn(1).width}, B=${newSheet.getColumn(2).width}, C=${newSheet.getColumn(3).width}, D=${newSheet.getColumn(4).width}`);
    
    // Uložíme změny do cílového souboru
    logger.info(`Ukládám změny do souboru: ${targetFilePath}`);
    await targetWorkbook.xlsx.writeFile(targetFilePath);

    logger.info(
      `Nový list '${newSheetName}' byl úspěšně vytvořen v souboru ${targetFileName} s ${sourceData.length} řádky dat`
    );

    return {
      success: true,
      message: `Data byla úspěšně uložena do nového listu '${newSheetName}'. Otevřete Excel a spusťte makro pro jejich zpracování.`,
      newSheetName,
    };
  } catch (error) {
    logger.error(`Chyba při vytváření nového listu: ${error}`, {
      error: error instanceof Error ? error.message : 'Neznámá chyba',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neznámá chyba",
    };
  }
}

/**
 * Funkce pro zjištění zdrojového a cílového souboru pro kopírování
 * @param result Výsledek z getAvarisData funkce
 * @param uploadedFileName Název souboru nahraného uživatelem
 * @returns Objekt s informacemi o souborech
 */
export async function getFileInfo(result: any, uploadedFileName: string) {
  // Pokud result existuje a má processedData
  if (result && result.processedData) {
    // Hledáme první objekt, který má definovanou vlastnost xlsxFilePath
    for (const [objektName, data] of Object.entries(result.processedData)) {
      // Použijeme as any, abychom obešli TypeScript chyby
      const objData = data as any;
      if (objData && objData.xlsxFilePath) {
        // Extrahujeme název souboru z cesty
        const sourceFileName = objData.xlsxFilePath.split("/").pop();
        if (sourceFileName) {
          return {
            sourceFile: sourceFileName,
            targetFile: uploadedFileName,
            found: true,
          };
        }
      }
    }
  }

  // Pokud jsme nenašli soubor
  return {
    sourceFile: null,
    targetFile: uploadedFileName,
    found: false,
  };
}