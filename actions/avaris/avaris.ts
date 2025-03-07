// app/actions/avaris/avaris.ts
"use server";

import { revalidatePath } from "next/cache";
import { createLogger } from "@/modules/avaris/services/logger";
import { captureAvarisData } from "@/modules/avaris/services/scraper";
import { batchProcessAvarisData } from "@/modules/avaris/services/csvProcessor";

const logger = createLogger("avaris-action");

export async function getAvarisData(formData: FormData) {
  try {
    logger.info("Zpracovávám požadavek na získání Avaris dat");

    const ico = formData.get("ico") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Získání objektů - nyní podporujeme více objektů
    const objektInput = (formData.get("objekty") as string) || "RENOCAR";
    // Rozdělíme vstup podle řádků nebo čárek a odstraníme prázdné záznamy
    const objektNames = objektInput
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

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

    // Použití hodnot z formuláře nebo výchozích hodnot
    const dateFrom = (formData.get("dateFrom") as string) || defaultDateFrom;
    const dateTo = (formData.get("dateTo") as string) || defaultDateTo;

    if (!ico || !username || !password) {
      logger.error("Chybí přihlašovací údaje");
      return { success: false, error: "Chybí přihlašovací údaje" };
    }

    logger.info(
      `Spouštím captureAvarisData pro objekty: ${objektNames.join(", ")}`
    );

    try {
      const downloadedFiles = await captureAvarisData(
        ico,
        username,
        password,
        objektNames,
        dateFrom,
        dateTo
      );

      // Pokud jsme získali nějaké soubory, zpracujeme je
      if (Object.keys(downloadedFiles).length > 0) {
        logger.info("Zpracovávám stažené CSV soubory");
        const processedData = await batchProcessAvarisData(downloadedFiles);

        // Invalidovat cache pro cestu, kde jsou zobrazena data
        revalidatePath("/avaris-data");

        return {
          success: true,
          files: downloadedFiles,
          processedData,
          timestamp: new Date().toISOString(),
          processedCount: Object.keys(processedData).length,
          totalCount: objektNames.length,
        };
      } else {
        logger.warn("Žádné soubory nebyly staženy");
        return {
          success: false,
          error: "Žádné soubory nebyly staženy",
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      // Zachycení a logování chyby ze scraperu
      logger.error(`Chyba při scrapování: ${error}`);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Chyba při získávání dat z portálu Avaris",
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    logger.error("Chyba v server action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Neznámá chyba",
    };
  }
}
