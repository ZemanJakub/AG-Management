// modules/avaris/services/scraper.ts
import { chromium } from "@playwright/test";
import fs from "fs/promises";
import path from "path";
import { createLogger } from "./logger"; // Importujeme logovací službu

const COOKIES_PATH = path.join(process.cwd(), "data", "avaris-cookies.json");
const logger = createLogger("scraper"); // Vytvoříme logger pro tento modul

// Původní funkce (ponecháme je beze změny)
export async function ensureDirectoryExists() {
  const dir = path.dirname(COOKIES_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function saveCookies(context: any) {
  await ensureDirectoryExists();
  const cookies = await context.cookies();
  await fs.writeFile(COOKIES_PATH, JSON.stringify(cookies));
}

export async function loadCookies(): Promise<any[] | null> {
  try {
    await ensureDirectoryExists();
    const data = await fs.readFile(COOKIES_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log("Cookies file not found or invalid");
    return null;
  }
}

// Zachováme původní performLogin funkci
async function performLogin(
  page: any,
  ico: string,
  username: string,
  password: string
) {
  try {
    await page.goto("https://portal.avaris.cz/login.php");

    // Ujistíme se, že jsme na záložce "Uživatel"
    await page.click('#tabs ul li a[href="#tabs-uzivatel"]');

    // Vyplnění přihlašovacích údajů
    await page.fill('input[name="aid"]', ico);
    await page.fill('input[name="user"]', username);
    await page.fill('input[name="pwd"]', password);

    // Přidáme page.on pro sledování response
    let navigationPromise = page.waitForResponse(
      (response: { url: () => string | string[] }) =>
        response.url().includes("update.login.php"),
      { timeout: 30000 }
    );

    // Odeslání formuláře
    await page.click("button.button-login");

    // Počkáme na odpověď z přihlašovacího požadavku
    await navigationPromise;

    // Nyní místo čekání na navigaci počkáme na změnu URL nebo konkrétní element
    // na dashboardu, který se objeví po úspěšném přihlášení
    try {
      // Počkáme maximálně 10 sekund na změnu URL
      await page.waitForURL(/.*\/index\.php.*|.*\/prehled\.php.*/, {
        timeout: 10000,
      });
    } catch (error) {
      // Pokud se URL nezmění, zkusíme vyhledat některý element, který by
      // měl být viditelný po přihlášení
      await page
        .waitForSelector(".user-panel, .dashboard, #main-menu", {
          state: "visible",
          timeout: 10000,
        })
        .catch(() => {
          // Pokud nenajdeme ani tento element, uděláme screenshot pro debugging
          const debugPath = path.join(
            process.cwd(),
            "public",
            "screenshots",
            "debug-login.png"
          );
          page.screenshot({ path: debugPath, fullPage: true });
          throw new Error(
            "Nelze detekovat úspěšné přihlášení. Kontrolní screenshot uložen."
          );
        });
    }

    // Další kontrola, zda přihlášení bylo úspěšné
    const url = page.url();
    if (url.includes("login.php") || url.includes("error")) {
      const errorMsg = await page.evaluate(() => {
        const errorElement = document.querySelector(".error, .error-message");
        return errorElement
          ? errorElement.textContent
          : "Neznámá chyba při přihlašování";
      });
      throw new Error(`Přihlášení se nezdařilo: ${errorMsg}`);
    }

    logger.info("Přihlášení úspěšné, nová URL:", page.url());
  } catch (error) {
    logger.error("Chyba při přihlašování:", error);
    throw error;
  }
}

// Aktualizovaná funkce pro dávkové zpracování
export async function captureAvarisData(
  ico: string | undefined,
  username: string | undefined,
  password: string | undefined,
  objektNames: string[] = ["RENOCAR"], // Nyní pole objektů pro dávkové zpracování
  dateFrom: string = "01.03.2025",
  dateTo: string = "07.03.2025"
): Promise<{ [key: string]: string }> { // Vraťme objekt s cestami ke staženým souborům podle objektů
  logger.info(`Spouštím captureAvarisData pro ${objektNames.length} objektů`);
  
  // Dynamicky načteme playwright z testovací instance
  const browser = await chromium.launch({ headless: true }); // V produkci obvykle headless: true
  const context = await browser.newContext();
  const page = await context.newPage();
  
  if(!ico||!username||!password){
    logger.warn("Přihlašovací údaje nebyly poskytnuty, používám výchozí hodnoty");
    ico = "25790668";
    username = "reditel@ares-group.cz";
    password = "slunicko";
  }
 
  // Přidání logerů pro browser konzoli
  page.on("console", (msg) => logger.debug(`BROWSER CONSOLE: ${msg.text()}`));
  page.on("pageerror", (err) => logger.error(`BROWSER ERROR: ${err.message}`));
  page.on("requestfailed", (request) =>
    logger.error(`REQUEST FAILED: ${request.url()}`)
  );

  // Objekt pro uchování všech stažených souborů
  const downloadedFiles: { [key: string]: string } = {};

  try {
    // Zkusit použít existující cookies
    logger.info("Pokus o použití existujících cookies");
    const cookies = await loadCookies();
    if (cookies) {
      await context.addCookies(cookies);

      // Zkusit přistoupit přímo na dashboard
      await page.goto("https://portal.avaris.cz/index.php");

      // Zkontrolovat, zda jsme přihlášeni
      const isLoggedIn = await page.evaluate(() => {
        return (
          document.querySelector("body") !== null &&
          !document.querySelector('form[action*="update.login.php"]')
        );
      });

      if (!isLoggedIn) {
        logger.info("Cookies vypršely, přihlašuji se znovu");
        await performLogin(page, ico, username, password);
      } else {
        logger.info("Úspěšně přihlášeno pomocí cookies");
      }
    } else {
      logger.info("Žádné cookies nenalezeny, přihlašuji se");
      await performLogin(page, ico, username, password);
    }

    // Iterujeme přes všechny objekty
    for (const objektName of objektNames) {
      logger.info(`Zpracovávám objekt: ${objektName}`);
      
      try {
        // Navigace na stránku vyhodnocení snímačů
        logger.info('Navigace na stránku vyhodnocení snímačů');
        await page.goto('https://portal.avaris.cz/vyhodnoceni.snimace.php?akce=edit&id=11505');
        
        // Počkáme na načtení stránky
        await page.waitForLoadState('domcontentloaded');
        logger.info('Stránka vyhodnocení snímačů načtena');
        
        // ===== UPRAVENÝ KÓD PRO PRÁCI S TABULKAMI =====
        logger.info('Začínám manipulaci s tabulkami');
        
        // 1. Nejprve odstraníme všechny položky z tabulky "table-vypis"
        const removeButtons = await page.$$('table.table-vypis a[title="Odebrat"]');
        logger.info(`Nalezeno ${removeButtons.length} položek k odstranění`);
        
        for (const button of removeButtons) {
          await button.click();
          // Zkrácená pauza po každém kliknutí na odebrat
          await page.waitForTimeout(300);
        }
        logger.info('Všechny položky byly odebrány');
        
        // Zkrácená pauza po odebrání všech položek
        await page.waitForTimeout(500);
        
        // 2. Nyní přidáme požadovaný objekt
        try {
          logger.info(`Hledám checkbox pro objekt "${objektName}"`);
          
          // Najdeme label s požadovaným textem
          const label = await page.locator(`label.cursor-pointer:text-is("${objektName}")`);
          const labelCount = await label.count();
          
          if (labelCount > 0) {
            // Získáme 'for' atribut
            const forAttr = await label.getAttribute('for');
            logger.info(`Nalezen label s for="${forAttr}"`);
            
            if (forAttr) {
              // Najdeme a označíme checkbox
              const checkbox = await page.locator(`#${forAttr}`);
              await checkbox.check();
              logger.info(`Checkbox #${forAttr} byl zaškrtnut`);
              
              // Klikneme na tlačítko Přidat >>
              logger.info('Klikám na tlačítko "Přidat"');
              await page.click('button >> text=Přidat');
              
              // Zkrácená pauza po kliknutí na "Přidat"
              await page.waitForTimeout(1000);
              
              // Pokusíme se ověřit, že se položka objevila v tabulce
              const itemInTable = await page.locator(`table.table-vypis tr td:has-text("${objektName}")`).count();
              if (itemInTable > 0) {
                logger.info(`Objekt "${objektName}" byl úspěšně přidán do tabulky`);
              } else {
                logger.warn(`Objekt "${objektName}" nebyl nalezen v tabulce po přidání!`);
              }
            } else {
              throw new Error(`Label pro "${objektName}" nemá atribut 'for'!`);
            }
          } else {
            // Pokud nenajdeme label přesně podle textu, zkusíme vyhledat částečnou shodu
            logger.info(`Přesný text nenalezen, zkouším částečnou shodu pro "${objektName}"`);
            const labelPartial = await page.locator(`label.cursor-pointer:has-text("${objektName}")`);
            const labelPartialCount = await labelPartial.count();
            
            if (labelPartialCount > 0) {
              const forAttr = await labelPartial.getAttribute('for');
              logger.info(`Nalezen label s for="${forAttr}" (částečná shoda)`);
              
              if (forAttr) {
                const checkbox = await page.locator(`#${forAttr}`);
                await checkbox.check();
                logger.info(`Checkbox #${forAttr} byl zaškrtnut`);
                
                // Klikneme na tlačítko Přidat >>
                await page.click('button >> text=Přidat');
                await page.waitForTimeout(1000);
              } else {
                throw new Error(`Label pro "${objektName}" (částečná shoda) nemá atribut 'for'!`);
              }
            } else {
              throw new Error(`Objekt "${objektName}" nebyl nalezen ani pomocí částečné shody!`);
            }
          }
        } catch (error) {
          logger.error(`Chyba při hledání a označení objektu ${objektName}: ${error}`);
          // Pokračujeme s dalším objektem místo ukončení celého procesu
          continue;
        }
        
        // 3. Klikneme na tlačítko "Uložit" pro potvrzení změn
        logger.info('Klikám na tlačítko "Uložit"');
        
        // Vyhledáme tlačítko uložit podle různých selektorů
        try {
          // Zkusíme najít tlačítko podle textu
          const saveButton = await page.locator('button.button-save');
          
          if (await saveButton.count() > 0) {
            await saveButton.click();
            logger.info('Tlačítko "Uložit" bylo stisknuto');
            
            // Počkáme na dokončení ukládání
            await page.waitForLoadState('domcontentloaded');
            logger.info('Ukládání dokončeno');
          } else {
            logger.warn('Tlačítko "Uložit" nebylo nalezeno!');
          }
        } catch (error) {
          logger.error(`Chyba při ukládání změn: ${error}`);
        }
        
        // 4. Nyní nastavíme datumové vstupy
        logger.info(`Nastavuji datumové rozmezí: ${dateFrom} - ${dateTo}`);
        
        try {
          // Vyčistíme a nastavíme datum "od"
          await page.fill('#dateOd', '');
          await page.fill('#dateOd', dateFrom);
          
          // Vyčistíme a nastavíme datum "do"
          await page.fill('#dateDo', '');
          await page.fill('#dateDo', dateTo);
          
          logger.info('Datumové rozmezí bylo nastaveno');
        } catch (error) {
          logger.error(`Chyba při nastavování datumů: ${error}`);
        }
        
        // 5. Klikneme na odkaz "Vyhodnotit" a budeme sledovat otevření nového okna/záložky
        logger.info('Připravuji se na kliknutí na tlačítko "Vyhodnotit" a otevření nového okna');
        
        // Nastavíme si poslech na otevření nového okna
        const popupPromise = context.waitForEvent('page');
        
        // Klikneme na odkaz "Vyhodnotit"
        await page.click('#vyhodnoceni-button');
        logger.info('Tlačítko "Vyhodnotit" stisknuto, čekám na otevření nového okna');
        
        // Počkáme na nově otevřené okno
        const popupPage = await popupPromise;
        logger.info('Nové okno bylo otevřeno, čekám na načtení obsahu');
        
        // Počkáme na načtení obsahu v novém okně
        await popupPage.waitForLoadState('domcontentloaded');
        
        // Nyní hledáme tlačítko CSV v novém okně
        logger.info('Hledám tlačítko CSV v novém okně');
        
        // Nastavíme posluchač stahování - prodloužíme timeout
        const downloadPromise = popupPage.waitForEvent('download', { timeout: 60000 });
        
        // Zkusíme kliknout na tlačítko CSV podle různých selektorů
        try {
          const csvButton = await popupPage.locator('button.button-xls:has-text("CSV"), button:has-text("CSV")');
          
          if (await csvButton.count() > 0) {
            await csvButton.click();
            logger.info('Tlačítko CSV bylo stisknuto');
            
            // Počkáme na stažení souboru
            const download = await downloadPromise;
            
            if (download) {
              const fileName = `${objektName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.csv`;
              const downloadPath = path.join(process.cwd(), 'public', 'downloads', fileName);
              
              // Vytvoříme adresář, pokud neexistuje
              await fs.mkdir(path.dirname(downloadPath), { recursive: true }).catch(() => {});
              
              // Uložíme soubor
              await download.saveAs(downloadPath);
              logger.info(`CSV soubor byl stažen do: ${downloadPath}`);
              
              // Uložíme cestu do výsledného objektu
              downloadedFiles[objektName] = `/downloads/${fileName}`;
            } else {
              logger.warn('Nepodařilo se stáhnout CSV soubor po kliknutí na tlačítko');
            }
          } else {
            logger.warn('Tlačítko CSV nebylo nalezeno v novém okně');
            
            // Alternativní přístup - projdeme všechna tlačítka a vybereme to, které má v onclick "export=csv"
            const buttonWithCsvExport = await popupPage.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button'));
              for (const button of buttons) {
                const onclick = button.getAttribute('onclick') || '';
                if (onclick.includes('export=csv')) {
                  return true;
                }
              }
              return false;
            });
            
            if (buttonWithCsvExport) {
              await popupPage.click('button[onclick*="export=csv"]');
              logger.info('Nalezeno a stisknuto tlačítko s onclick obsahujícím "export=csv"');
              
              // Počkáme na stažení souboru
              const download = await downloadPromise;
              
              if (download) {
                const fileName = `${objektName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.csv`;
                const downloadPath = path.join(process.cwd(), 'public', 'downloads', fileName);
                
                // Vytvoříme adresář, pokud neexistuje
                await fs.mkdir(path.dirname(downloadPath), { recursive: true }).catch(() => {});
                
                // Uložíme soubor
                await download.saveAs(downloadPath);
                logger.info(`CSV soubor byl stažen do: ${downloadPath} (pomocí tlačítka s onclick)`);
                
                // Uložíme cestu do výsledného objektu
                downloadedFiles[objektName] = `/downloads/${fileName}`;
              }
            } else {
              logger.error('Žádné tlačítko pro export CSV nebylo nalezeno ani pomocí onclick atributu');
            }
          }
        } catch (error) {
          logger.error(`Chyba při práci s tlačítkem CSV pro objekt ${objektName}: ${error}`);
        }
        
        // Před zpracováním dalšího objektu zavřeme popup okno
        await popupPage.close();
        logger.info(`Dokončeno zpracování objektu: ${objektName}`);
        
      } catch (error) {
        logger.error(`Chyba při zpracování objektu ${objektName}: ${error}`);
        // Pokračujeme s dalším objektem
      }
    }
    
    // Uložení aktualizovaných cookies
    await saveCookies(context);
    logger.info(`Celkem zpracováno ${Object.keys(downloadedFiles).length} objektů z ${objektNames.length}`);
    
    return downloadedFiles;
  } catch (error) {
    logger.error("Chyba při scrapování:", error);
    throw error;
  } finally {
    await browser.close();
    logger.info("Browser uzavřen");
  }
}