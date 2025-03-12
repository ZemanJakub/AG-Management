// app/actions/avaris/avaris.ts
"use server";

import { revalidatePath } from "next/cache";
import { createLogger } from "@/modules/cipovacky/services/logger";
import { captureAvarisData } from "@/modules/cipovacky/services/scraper";
import { processAvarisData } from "@/modules/cipovacky/services/csvProcessor";


const logger = createLogger("avaris-action");

export type AvarisResult = {
  success: boolean;
  error?: string;
  files?: { [key: string]: string };
  processedData?: any;
  timestamp?: string;
  processedCount?: number;
  totalCount?: number;
};

/**
 * Serverová akce pro získání a zpracování dat z Avarisu pro případ 2 (čipovačky)
 * @param formData Formulářová data od uživatele
 */
function formatDateString(dateStr: string): string {
  if (!dateStr) return "";
  
  // Zkontrolujeme, zda formát odpovídá očekávanému "YYYY-MM-DD"
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [_, year, month, day] = match;
    return `${day}.${month}.${year}`;
  }
  
  // Pokud je datum již ve správném formátu nebo v jiném formátu, vrátíme ho beze změny
  return dateStr;
}
export async function processAvarisRequest(formData: FormData): Promise<AvarisResult> {
  try {
    logger.info("Zpracovávám požadavek na získání dat z Avarisu");
    
    // Krok 1: Načtení parametrů z formuláře
    const ico = "25790668" as string; // Hardcoded přihlašovací údaje
    const username = "reditel@ares-group.cz" as string;
    const password = "slunicko" as string;

    // Získání objektů - podporujeme více objektů

    const objektInput = (formData.get("objekty") as string);
    console.log("objekty",objektInput)
    const objektNames = objektInput
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    console.log("objektNames",objektNames)  
    if (objektNames.length === 0) {
      logger.warn('Nebyly zadány žádné objekty, používám výchozí "RENOCAR"');
      objektNames.push("RENOCAR");
    }

    // Získání datumů z formuláře s výchozími hodnotami
    const today = new Date();
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    // Výchozí datum od: o 7 dní zpět
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const defaultDateFrom = formatDate(sevenDaysAgo);
    const defaultDateTo = formatDate(today);
// Pomocná funkce pro převod formátu data z "YYYY-MM-DD" na "DD.MM.YYYY"



    // Použití hodnot z formuláře nebo výchozích hodnot
    const dateFrom = formatDateString(formData.get("dateFrom") as string) || defaultDateFrom;
    const dateTo = formatDateString(formData.get("dateTo") as string) || defaultDateTo;

    console.log("dateFrom",dateFrom)
    console.log("dateTo",dateTo)

    // Krok 2: Získání dat z Avarisu
    logger.info(`Spouštím captureAvarisData pro objekty: ${objektNames.join(", ")}`);
    
    const downloadedFiles = await captureAvarisData(
      ico,
      username,
      password,
      objektNames,
      dateFrom,
      dateTo
    );

    // Krok 3: Zpracování stažených CSV souborů
    if (Object.keys(downloadedFiles).length === 0) {
      logger.warn("Žádné soubory nebyly staženy");
      return {
        success: false,
        error: "Žádné soubory nebyly staženy",
        timestamp: new Date().toISOString(),
      };
    }
    
    logger.info("Zpracovávám stažené CSV soubory");
    const processedData:any = {};
    
    // Zpracování dat pro každý objekt
    for (const [objektName, filePath] of Object.entries(downloadedFiles)) {
      try {
        const result = await processAvarisData(filePath);
        processedData[objektName] = result;
      } catch (error) {
        logger.error(`Chyba při zpracování dat pro objekt ${objektName}: ${error}`);
      }
    }

    // Invalidovat cache pro cestu
    revalidatePath("/avaris/cipovacky");

    return {
      success: true,
      files: downloadedFiles,
      processedData,
      timestamp: new Date().toISOString(),
      processedCount: Object.keys(processedData).length,
      totalCount: objektNames.length
    };
  } catch (error) {
    logger.error("Chyba v server action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neznámá chyba",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Původní funkce pro zpětnou kompatibilitu
 */
export async function getAvarisData(formData: FormData) {
  return processAvarisRequest(formData);
}