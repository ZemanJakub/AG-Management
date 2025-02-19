import { chromium } from '@playwright/test';
import fs from 'fs';

(async () => {
  // Spusť prohlížeč v režimu bez hlavičky (headless)
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const submitButton = page.locator('[data-testid="login-button"]');
  // Přejděte na stránku přihlášení
  await page.goto('http://localhost:3000/signin');

  // Vyplňte přihlašovací formulář (upravit selektory dle vaší implementace)
  await page.fill('input[name="email"]', "test@gmail.com");
  await page.fill('input[name="password"]', "Test1");
  await submitButton.click({ force: true });
  // Počkejte, dokud se nepřesměruje na dashboard (nebo jinou chráněnou stránku)
  await page.waitForURL('http://localhost:3000/dashboard');

  // Získejte cookies
  const cookies = await context.cookies();

  // Převod cookies na řetězec, který se použije jako hodnota hlavičky "Cookie"
  const cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

  // Uložení do souboru extra-headers.json
  fs.writeFileSync('extra-headers.json', JSON.stringify({ Cookie: cookieHeader }, null, 2));

  console.log('Extra headers saved:', { Cookie: cookieHeader });

  await browser.close();
})();
