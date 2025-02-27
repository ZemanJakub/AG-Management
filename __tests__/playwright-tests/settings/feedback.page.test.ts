import { test, expect } from "@playwright/test";

test.describe("Feedback Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    // Díky storageState je uživatel přihlášen (nastaveno v playwright.config.ts)
    await page.goto("/settings/feedback");
  });

  test("should display header, SettingsSidebar and FeedbackPanel", async ({
    page,
  }) => {
    // Ověříme, že hlavní stránka má nadpis "Nastavení"
    await expect(page.locator("h1")).toHaveText("Nastavení");

    // Ověříme, že se zobrazuje SettingsSidebar
    await expect(page.locator("#sidebar")).toBeVisible();
  });

  test("should display elements correctly", async ({ page }) => {
    // Ověříme, že se zobrazuje nadpis "Zpětná vazba"
    await expect(page.locator("h2", { hasText: "Zpětná vazba" })).toBeVisible();

    // Ověříme, že se zobrazuje text s výzvou k zadání zpětné vazby
    await expect(
      page.locator("div.text-sm", {
        hasText: /Na uživatelské zkušenosti nám velmi záleží/,
      })
    ).toBeVisible();

    // Ověříme, že se zobrazují sekce s hodnocením a textovým polem
    await expect(
      page.locator("section", { hasText: "Jak se Vám líbí naše aplikace?" })
    ).toBeVisible();
    await expect(
      page.locator("section", { hasText: "Máte nějaké návrhy na zlepšení?" })
    ).toBeVisible();

    // Ověříme, že se zobrazují tlačítka "Zrušit" a "Odeslat"
    await expect(page.locator("button", { hasText: "Zrušit" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Odeslat" })).toBeVisible();
  });

  test("should handle text input", async ({ page }) => {
    // Zadáme text do textového pole
    await page.locator("textarea#feedback").fill("Toto je moje zpětná vazba.");

    // Ověříme, že se text uložil do textového pole
    await expect(page.locator("textarea#feedback")).toHaveValue(
      "Toto je moje zpětná vazba."
    );
  });

  test("should display sections and links correctly", async ({ page }) => {
    // Ověříme, že se zobrazují nadpisy sekcí
    await expect(
      page.locator(
        "div.text-xs.font-semibold.text-gray-400.dark\\:text-gray-500.uppercase.mb-3",
        { hasText: "Obecná nastavení" }
      )
    ).toBeVisible();
    await expect(
      page.locator(
        "div.text-xs.font-semibold.text-gray-400.dark\\:text-gray-500.uppercase.mb-3",
        { hasText: "Uživatelská zkušenost" }
      )
    ).toBeVisible();

    const sidebarSection = page.locator("div", { hasText: "Obecná nastavení" });

    // Ověříme, že se zobrazují odkazy v sekci "Obecná nastavení"
    const accountLink = sidebarSection.getByRole("link", { name: "Můj účet" });
    await expect(accountLink).toBeVisible();

    const notificationsLink = sidebarSection.getByRole("link", {
      name: "Notifikace",
    });
    await expect(notificationsLink).toBeVisible();

    const appsLink = sidebarSection.getByRole("link", { name: "Aplikace" });
    await expect(appsLink).toBeVisible();

    // Ověříme, že se zobrazuje odkaz v sekci "Uživatelská zkušenost"
    const feedbackLink = sidebarSection.getByRole("link", {
      name: "Zpětná vazba",
    });
    await expect(feedbackLink).toBeVisible();
  });

  test("should handle rating functionality", async ({ page }) => {
    // Vybereme hodnocení 3 hvězdičky
    await page.locator("button", { hasText: "3" }).click();

    // Ověříme, že se vizuálně zvýraznilo vybrané hodnocení
    await expect(page.locator("button", { hasText: "3" })).toHaveClass(
      /bg-violet-500/
    );

    // Vybereme hodnocení 5 hvězdiček
    await page.locator("button", { hasText: "5" }).click();

    // Ověříme, že se vizuálně zvýraznilo nové hodnocení a skrylo se předchozí
    await expect(page.locator("button", { hasText: "5" })).toHaveClass(
      /bg-violet-500/
    );
    await expect(page.locator("button", { hasText: "3" })).not.toHaveClass(
      /bg-violet-500/
    );
  });

  test("should handle button clicks", async ({ page }) => {
    // Vybereme hodnocení a zadáme text do textového pole
    await page.locator("button", { hasText: "4" }).click();
    await page.locator("textarea#feedback").fill("Toto je moje zpětná vazba.");

    // Klikneme na tlačítko "Zrušit"
    await page.locator("button", { hasText: "Zrušit" }).click();

    // Ověříme, že se hodnocení a text smazaly
    await expect(page.locator("button", { hasText: "4" })).not.toHaveClass(
      /bg-violet-500/
    );
    await expect(page.locator("textarea#feedback")).toHaveValue("");

    // Vybereme hodnocení a zadáme text do textového pole
    await page.locator("button", { hasText: "4" }).click();
    await page.locator("textarea#feedback").fill("Toto je moje zpětná vazba.");

    // Klikneme na tlačítko "Odeslat"
    const submitButton = page.locator("button", { hasText: "Odeslat" });
    await submitButton.click();

    // Ověříme, že se zobrazil toast s informací o ukládání
    await expect(page.locator(".Toastify__toast--info")).toContainText(
      "Ukládám údaje."
    );

    // Čekáme na success toast
    await expect(page.locator(".Toastify__toast--success")).toContainText(
      "Údaje byly úspěšně uloženy."
    );

    // Ověříme, že se data resetovala
    await expect(page.locator("button", { hasText: "4" })).not.toHaveClass(
      /bg-violet-500/
    );
    await expect(page.locator("textarea#feedback")).toHaveValue("");
  });
});
