// modules/avaris/services/scraper.ts
import { chromium } from "@playwright/test";
import fs from "fs/promises";
import path from "path";
import { StructuredLogger } from "./structuredLogger";

const COOKIES_PATH = path.join(process.cwd(), "data", "avaris-cookies.json");
const logger = StructuredLogger.getInstance().getComponentLogger("scraper");

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
    logger.debug("Cookies soubor nenalezen nebo neplatný", { error });
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

    logger.info("Přihlášení úspěšné", { url: page.url() });
  } catch (error) {
    logger.error("Chyba při přihlašování", { error });
    throw error;
  }
}

// Vylepšená funkce pro přidání objektu do pravého sloupce
/**
 * Pomocná funkce pro přidání objektu do pravého sloupce s opakovanými pokusy.
 * Funkce kontroluje, zda se objekt skutečně objevil v pravé tabulce.
 * 
 * @param page Playwright Page objekt
 * @param objektName Název objektu, který má být přidán
 * @param maxRetries Maximální počet pokusů o přidání objektu
 * @returns Promise<boolean> True pokud byl objekt úspěšně přidán, jinak false
 */
async function addObjectToRightColumn(
  page: any, // Ideálně by zde měl být přesný typ z Playwright
  objektName: string,
  maxRetries: number = 3
): Promise<boolean> {
  // Získání instance loggeru pro tuto komponentu
  const logger = StructuredLogger.getInstance().getComponentLogger("scraper");
  
  // Zpracování přidání objektu s možností opakovaných pokusů
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Pokus #${attempt}: Hledám checkbox pro objekt`, { objektName });

      // 1. Najdeme label s požadovaným textem - přesná shoda
      const label = await page.locator(
        `label.cursor-pointer:text-is("${objektName}")`
      );
      const labelCount = await label.count();

      if (labelCount > 0) {
        // Získáme 'for' atribut z labelu
        const forAttr = await label.getAttribute("for");
        logger.info(`Nalezen label s atributem`, { forAttr });

        if (forAttr) {
          // Najdeme a označíme checkbox
          const checkbox = await page.locator(`#${forAttr}`);
          await checkbox.check();
          logger.info(`Checkbox zaškrtnut`, { checkboxId: forAttr });

          // Klikneme na tlačítko Přidat >>
          logger.info('Klikám na tlačítko "Přidat"');
          await page.click("button >> text=Přidat");

          // Delší pauza po kliknutí na "Přidat" - zvyšujeme pravděpodobnost úspěchu
          await page.waitForTimeout(2000);

          // Ověříme, že se položka objevila v tabulce pomocí více různých selektorů
          const tableItemSelectors = [
            `table.table-vypis tr td:has-text("${objektName}")`,
            `table.table-vypis tr:has-text("${objektName}")`,
            `table.table-vypis tr td:text-is("${objektName}")`,
            `table.table-vypis tr td:text-matches("${objektName}", "i")`  // Nezávislé na velikosti písmen
          ];
          
          // Postupně zkusíme všechny selektory
          let itemFound = false;
          for (const selector of tableItemSelectors) {
            const count = await page.locator(selector).count();
            if (count > 0) {
              itemFound = true;
              logger.info(`Objekt nalezen v tabulce pomocí selektoru`, { selector, objektName });
              break;
            }
          }
            
          if (itemFound) {
            logger.info(`Objekt byl úspěšně přidán do tabulky`, { objektName, attempt });
            return true; // Úspěšné přidání
          } else {
            logger.warn(`Objekt nebyl nalezen v tabulce po přidání (pokus #${attempt})`, { objektName });
            
            // Zkusíme screenshotem zachytit stav
            if (attempt === maxRetries) {
              try {
                const screenshotPath = path.join(
                  process.cwd(),
                  "public",
                  "screenshots",
                  `failed-add-${objektName.replace(/[^a-z0-9]/gi, "-")}.png`
                );
                await fs.mkdir(path.dirname(screenshotPath), { recursive: true }).catch(() => {});
                await page.screenshot({ path: screenshotPath });
                logger.info(`Vytvořen screenshot chybového stavu`, { screenshotPath });
              } catch (screenshotError) {
                logger.error(`Nepodařilo se vytvořit screenshot`, { error: screenshotError });
              }
            }
            
            // Pokud to není poslední pokus, zkusíme znovu
            if (attempt < maxRetries) {
              logger.info(`Zkusím přidat objekt znovu (pokus #${attempt+1})`, { objektName });
              
              // Před dalším pokusem počkáme o něco déle
              await page.waitForTimeout(1000 * attempt); // Postupně zvyšujeme čekací dobu
              continue;
            }
          }
        } else {
          throw new Error(`Label pro "${objektName}" nemá atribut 'for'!`);
        }
      } else {
        // 2. Pokud nenajdeme label přesně podle textu, zkusíme vyhledat částečnou shodu
        logger.info(
          `Přesný text nenalezen, zkouším částečnou shodu`, { objektName }
        );
        const labelPartial = await page.locator(
          `label.cursor-pointer:has-text("${objektName}")`
        );
        const labelPartialCount = await labelPartial.count();

        if (labelPartialCount > 0) {
          const forAttr = await labelPartial.getAttribute("for");
          logger.info(`Nalezen label s atributem (částečná shoda)`, { forAttr });

          if (forAttr) {
            const checkbox = await page.locator(`#${forAttr}`);
            await checkbox.check();
            logger.info(`Checkbox zaškrtnut (částečná shoda)`, { checkboxId: forAttr });

            // Klikneme na tlačítko Přidat >>
            await page.click("button >> text=Přidat");
            await page.waitForTimeout(2000);
            
            // Ověříme, že se položka objevila v tabulce
            const tableItemSelectors = [
              `table.table-vypis tr td:has-text("${objektName}")`,
              `table.table-vypis tr:has-text("${objektName}")`,
              `table.table-vypis tr td:text-matches("${objektName}", "i")`
            ];
            
            // Postupně zkusíme všechny selektory
            let itemFound = false;
            for (const selector of tableItemSelectors) {
              const count = await page.locator(selector).count();
              if (count > 0) {
                itemFound = true;
                logger.info(`Objekt nalezen v tabulce pomocí selektoru (částečná shoda)`, { selector, objektName });
                break;
              }
            }
              
            if (itemFound) {
              logger.info(`Objekt byl úspěšně přidán do tabulky (částečná shoda)`, { objektName });
              return true; // Úspěšné přidání
            } else {
              logger.warn(`Objekt nebyl nalezen v tabulce po přidání (částečná shoda, pokus #${attempt})`, { objektName });
              
              // Zkusíme screenshotem zachytit stav při posledním pokusu
              if (attempt === maxRetries) {
                try {
                  const screenshotPath = path.join(
                    process.cwd(),
                    "public",
                    "screenshots",
                    `failed-add-partial-${objektName.replace(/[^a-z0-9]/gi, "-")}.png`
                  );
                  await fs.mkdir(path.dirname(screenshotPath), { recursive: true }).catch(() => {});
                  await page.screenshot({ path: screenshotPath });
                  logger.info(`Vytvořen screenshot chybového stavu (částečná shoda)`, { screenshotPath });
                } catch (screenshotError) {
                  logger.error(`Nepodařilo se vytvořit screenshot`, { error: screenshotError });
                }
              }
              
              // Pokud to není poslední pokus, zkusíme znovu
              if (attempt < maxRetries) {
                logger.info(`Zkusím přidat objekt znovu (pokus #${attempt+1})`, { objektName });
                // Před dalším pokusem počkáme o něco déle
                await page.waitForTimeout(1000 * attempt);
                continue;
              }
            }
          } else {
            throw new Error(
              `Label pro "${objektName}" (částečná shoda) nemá atribut 'for'!`
            );
          }
        } else {
          // 3. Poslední pokus: zkusíme najít jakýkoli similar text
          logger.info(`Ani částečná shoda nenalezena, zkouším hledat podobné názvy`, { objektName });
          
          // Pokud systém používá zkratky, zkusíme vyhledat první 3-4 znaky objektu
          if (objektName.length > 4) {
            const shortPrefix = objektName.substring(0, 4);
            const prefixLabel = await page.locator(
              `label.cursor-pointer:has-text("${shortPrefix}")`
            );
            
            if (await prefixLabel.count() > 0) {
              const forAttr = await prefixLabel.getAttribute("for");
              if (forAttr) {
                logger.info(`Nalezen label s podobným prefixem`, { prefix: shortPrefix, forAttr });
                
                const checkbox = await page.locator(`#${forAttr}`);
                await checkbox.check();
                
                // Klikneme na tlačítko Přidat >>
                await page.click("button >> text=Přidat");
                await page.waitForTimeout(2000);
                
                // Kontrola přidání (použijeme méně striktní kritéria)
                const prefixInTable = await page.locator(`table.table-vypis tr:has-text("${shortPrefix}")`).count();
                if (prefixInTable > 0) {
                  logger.info(`Objekt s prefixem nalezen v tabulce`, { prefix: shortPrefix });
                  return true;
                }
              }
            }
          }
          
          throw new Error(
            `Objekt "${objektName}" nebyl nalezen ani pomocí částečné shody!`
          );
        }
      }
    } catch (error) {
      logger.error(
        `Chyba při hledání a označení objektu (pokus #${attempt})`, { 
          objektName, 
          error: error instanceof Error ? error.message : String(error)
        }
      );
      
      // Pokud to není poslední pokus, zkusíme znovu
      if (attempt < maxRetries) {
        logger.info(`Zkusím přidat objekt znovu po chybě (pokus #${attempt+1})`, { objektName });
        await page.waitForTimeout(1000 * attempt);
        continue;
      }
    }
  }
  
  // Pokud se dostaneme sem, znamená to, že všechny pokusy selhaly
  logger.error(`Nepodařilo se přidat objekt do pravého sloupce po ${maxRetries} pokusech`, { objektName });
  return false;
}

// Aktualizovaná funkce pro dávkové zpracování
export async function captureAvarisData(
  ico: string | undefined,
  username: string | undefined,
  password: string | undefined,
  objektNames: string[] = ["RENOCAR"], // Nyní pole objektů pro dávkové zpracování
  dateFrom: string = "01.03.2025",
  dateTo: string = "07.03.2025"
): Promise<{ [key: string]: string }> {
  // Vraťme objekt s cestami ke staženým souborům podle objektů
  logger.info(`Spouštím captureAvarisData`, { 
    objektCount: objektNames.length,
    objektNames,
    dateFrom,
    dateTo
  });

  // Dynamicky načteme playwright z testovací instance
  const browser = await chromium.launch({ headless: true }); // V produkci obvykle headless: true
  const context = await browser.newContext();
  const page = await context.newPage();

  if (!ico || !username || !password) {
    logger.warn(
      "Přihlašovací údaje nebyly poskytnuty, používám výchozí hodnoty"
    );
    ico = "25790668";
    username = "reditel@ares-group.cz";
    password = "slunicko";
  }

  // Přidání logerů pro browser konzoli
  page.on("console", (msg) => logger.debug(`BROWSER CONSOLE`, { message: msg.text() }));
  page.on("pageerror", (err) => logger.error(`BROWSER ERROR`, { error: err.message }));
  page.on("requestfailed", (request) =>
    logger.error(`REQUEST FAILED`, { url: request.url() })
  );

  // Objekt pro uchování všech stažených souborů
  const downloadedFiles: { [key: string]: string } = {};

  try {
    // Zkusit použít existující cookies
    logger.info("Pokus o použití existujících cookies");
    const cookies = await loadCookies();
    if (cookies) {
      await context.addCookies(cookies);

      // Zkontrolovat, zda jsme přihlášeni
      await page.goto("https://portal.avaris.cz/index.php");
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
      logger.info(`Zpracovávám objekt`, { objektName });

      try {
        // Navigace na stránku vyhodnocení snímačů
        logger.info("Navigace na stránku vyhodnocení snímačů");
        await page.goto(
          "https://portal.avaris.cz/vyhodnoceni.snimace.php?akce=edit&id=11505"
        );

        // Počkáme na načtení stránky
        await page.waitForLoadState("domcontentloaded");
        logger.info("Stránka vyhodnocení snímačů načtena");

        // ===== UPRAVENÝ KÓD PRO PRÁCI S TABULKAMI =====
        logger.info("Začínám manipulaci s tabulkami");

        // 1. Nejprve odstraníme všechny položky z tabulky "table-vypis"
        const removeButtons = await page.$$(
          'table.table-vypis a[title="Odebrat"]'
        );
        logger.info(`Nalezeno položek k odstranění`, { count: removeButtons.length });

        for (const button of removeButtons) {
          await button.click();
          // Zkrácená pauza po každém kliknutí na odebrat
          await page.waitForTimeout(800);
        }
        logger.info("Všechny položky byly odebrány");

        // Zkrácená pauza po odebrání všech položek
        await page.waitForTimeout(800);
 // 2. Nová funkce - Přidáme požadovaný objekt s kontrolou a opakováním
 const objectAdded = await addObjectToRightColumn(page, objektName);
        // 2. Nyní přidáme požadovaný objekt
if (objectAdded) {

        // 3. Klikneme na tlačítko "Uložit" pro potvrzení změn
        logger.info('Klikám na tlačítko "Uložit"');

        // Vyhledáme tlačítko uložit podle různých selektorů
        try {
          // Zkusíme najít tlačítko podle textu
          const saveButton = await page.locator("button.button-save");

          if ((await saveButton.count()) > 0) {
            await saveButton.click();
            logger.info('Tlačítko "Uložit" bylo stisknuto');

            // Počkáme na dokončení ukládání
            await page.waitForLoadState("domcontentloaded");
            logger.info("Ukládání dokončeno");
          } else {
            logger.warn('Tlačítko "Uložit" nebylo nalezeno');
          }
        } catch (error) {
          logger.error(`Chyba při ukládání změn`, { error });
        }
        
        // Nový krok: Nastavení období na "Interval" a výběr požadovaných sloupců
        logger.info('Nastavuji typ období na "Interval" a požadované sloupce');

        try {
          // 1. Nastavení období na "Interval"
          logger.info('Nastavuji období na "Interval"');
          const intervalRadio = await page.locator("#obdobi1");

          // Zkontrolujeme, zda je radio button již zaškrtnutý
          const isChecked = await intervalRadio.isChecked();

          if (!isChecked) {
            await intervalRadio.check();
            logger.info('Radio button pro "Interval" byl zaškrtnut');

            // Krátká pauza pro aplikaci změny
            await page.waitForTimeout(300);
          } else {
            logger.info('Radio button pro "Interval" již byl zaškrtnutý');
          }

          // 2. Nastavení sloupců pro výpis - nejprve odznačíme všechny
          logger.info("Začínám nastavovat sloupce pro výpis");

          // Najdeme všechny checkboxy pro sloupce
          const columnCheckboxes = await page.$$(
            'input[name="zaznam[tisk_sloupecky][]"]'
          );
          logger.info(`Nalezeno checkboxů pro sloupce`, { count: columnCheckboxes.length });

          // Odznačíme všechny checkboxy
          for (const checkbox of columnCheckboxes) {
            const isColumnChecked = await checkbox.isChecked();
            if (isColumnChecked) {
              await checkbox.uncheck();
              logger.debug("Odznačen checkbox pro sloupec");
            }
          }

          // 3. Zaškrtneme požadované sloupce podle hodnot
          const columnsToCheck = ["1", "3", "4", "8"]; // hodnoty pro Čas, Název bodu, Typ, Strážný
          logger.info(`Zaškrtávám požadované sloupce`, { columns: columnsToCheck });

          for (const columnValue of columnsToCheck) {
            const columnCheckbox = await page.locator(
              `input[name="zaznam[tisk_sloupecky][]"][value="${columnValue}"]`
            );
            await columnCheckbox.check();
            logger.debug(`Zaškrtnut checkbox pro sloupec`, { columnValue });
          }

          // 4. Ověření, že požadované sloupce jsou zaškrtnuté
          let allChecked = true;
          for (const columnValue of columnsToCheck) {
            const checkbox = await page.locator(
              `input[name="zaznam[tisk_sloupecky][]"][value="${columnValue}"]`
            );
            const isChecked = await checkbox.isChecked();

            if (!isChecked) {
              logger.warn(`Checkbox pro sloupec nebyl správně zaškrtnut`, { columnValue });
              allChecked = false;
            }
          }

          if (allChecked) {
            logger.info("Všechny požadované sloupce byly úspěšně zaškrtnuty");
          } else {
            logger.warn("Některé požadované sloupce se nepodařilo zaškrtnout");
          }
        } catch (error) {
          logger.error(`Chyba při nastavování období a sloupců`, { error });
          // Pokračujeme dál i přes chybu, aby se zpracování nezastavilo
        }
        // 4. Nyní nastavíme datumové vstupy
        logger.info(`Nastavuji datumové rozmezí`, { dateFrom, dateTo });

        try {
          // Vyčistíme a nastavíme datum "od"
          await page.fill("#dateOd", "");
          await page.fill("#dateOd", dateFrom);

          // Vyčistíme a nastavíme datum "do"
          await page.fill("#dateDo", "");
          await page.fill("#dateDo", dateTo);

          logger.info("Datumové rozmezí bylo nastaveno");
        } catch (error) {
          logger.error(`Chyba při nastavování datumů`, { error });
        }

        // 5. Klikneme na odkaz "Vyhodnotit" a budeme sledovat otevření nového okna/záložky
        logger.info('Připravuji se na kliknutí na tlačítko "Vyhodnotit"');

        // Nastavíme si poslech na otevření nového okna
        const popupPromise = context.waitForEvent("page");

        // Klikneme na odkaz "Vyhodnotit"
        await page.click("#vyhodnoceni-button");
        logger.info('Tlačítko "Vyhodnotit" stisknuto, čekám na nové okno');

        // Počkáme na nově otevřené okno
        const popupPage = await popupPromise;
        logger.info("Nové okno bylo otevřeno, čekám na načtení obsahu");

        // Počkáme na načtení obsahu v novém okně
        await popupPage.waitForLoadState("domcontentloaded");

        // Nyní hledáme tlačítko CSV v novém okně
        logger.info("Hledám tlačítko CSV v novém okně");

        // Nastavíme posluchač stahování - prodloužíme timeout
        const downloadPromise = popupPage.waitForEvent("download", {
          timeout: 60000,
        });

        // Zkusíme kliknout na tlačítko CSV podle různých selektorů
        try {
          const csvButton = await popupPage.locator(
            'button.button-xls:has-text("CSV"), button:has-text("CSV")'
          );

          if ((await csvButton.count()) > 0) {
            await csvButton.click();
            logger.info("Tlačítko CSV bylo stisknuto");

            // Počkáme na stažení souboru
            const download = await downloadPromise;

            if (download) {
              const fileName = `${objektName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_export.csv`;
              const downloadPath = path.join(
                process.cwd(),
                "public",
                "downloads",
                fileName
              );

              // Vytvoříme adresář, pokud neexistuje
              await fs
                .mkdir(path.dirname(downloadPath), { recursive: true })
                .catch(() => {});

              // Uložíme soubor
              await download.saveAs(downloadPath);
              logger.info(`CSV soubor byl stažen`, { path: downloadPath });

              // Uložíme cestu do výsledného objektu
              downloadedFiles[objektName] = `/downloads/${fileName}`;
            } else {
              logger.warn("Nepodařilo se stáhnout CSV soubor po kliknutí na tlačítko");
            }
          } else {
            logger.warn("Tlačítko CSV nebylo nalezeno v novém okně");

            // Alternativní přístup - projdeme všechna tlačítka a vybereme to, které má v onclick "export=csv"
            const buttonWithCsvExport = await popupPage.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll("button"));
              for (const button of buttons) {
                const onclick = button.getAttribute("onclick") || "";
                if (onclick.includes("export=csv")) {
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
                const fileName = `${objektName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_export.csv`;
                const downloadPath = path.join(
                  process.cwd(),
                  "public",
                  "downloads",
                  fileName
                );

                // Vytvoříme adresář, pokud neexistuje
                await fs
                  .mkdir(path.dirname(downloadPath), { recursive: true })
                  .catch(() => {});

                // Uložíme soubor
                await download.saveAs(downloadPath);
                logger.info(`CSV soubor byl stažen pomocí alternativního tlačítka`, { path: downloadPath });

                // Uložíme cestu do výsledného objektu
                downloadedFiles[objektName] = `/downloads/${fileName}`;
              }
            } else {
              logger.error("Žádné tlačítko pro export CSV nebylo nalezeno");
            }
          }
        } catch (error) {
          logger.error(`Chyba při práci s tlačítkem CSV`, { objektName, error });
        }
        await popupPage.close();
      } else {
        // Pokud se objekt nepodařilo přidat do pravého sloupce, přeskočíme zpracování
        logger.warn(`Přeskakuji zpracování objektu ${objektName}, protože se ho nepodařilo přidat do pravého sloupce`);
        continue; // Přejde na další objekt v cyklu
      }
        // Před zpracováním dalšího objektu zavřeme popup okno
        
        logger.info(`Dokončeno zpracování objektu`, { objektName });
      } catch (error) {
        logger.error(`Chyba při zpracování objektu`, { objektName, error });
        // Pokračujeme s dalším objektem
      }
    }

    // Uložení aktualizovaných cookies
    await saveCookies(context);
    logger.info(`Zpracování dokončeno`, { 
      processedCount: Object.keys(downloadedFiles).length, 
      totalObjectsCount: objektNames.length,
      downloadedFiles
    });

    return downloadedFiles;
  } catch (error) {
    logger.error("Chyba při scrapování", { error });
    throw error;
  } finally {
    await browser.close();
    logger.info("Browser uzavřen");
  }
}
