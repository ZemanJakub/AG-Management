import { test, expect } from "@playwright/test";

test.describe("Header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard"); // 🔧 Změň na správnou URL tvé aplikace
    await page.screenshot({ path: "dashboard.png", fullPage: true });
  });

  test("by se měl zobrazit správně", async ({ page }) => {
    // Ověření, že header existuje
    await page.setViewportSize({ width: 1024, height: 768 })
    const header = page.locator("header.sticky"); // ✅ Přesnější selektor
    await expect(header).toBeVisible();

    // Ověření, že jsou v něm hlavní prvky
    await expect(
      page.getByRole("button", { name: "Notifikace" })
    ).toBeVisible();
    await expect(page.locator("#light-switch")).toBeVisible();
    await expect(page.getByRole("img", { name: "User" })).toBeVisible(); // Ověření profilu
  });

  test("kliknutí na hamburger menu otevře sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 550 }); // 📱 Simulace mobilního zobrazení
  
    const menuButton = page.locator("#sidebarHeaderButton");
    await expect(menuButton).toBeVisible();
    await menuButton.click();
  
    const sidebar = page.locator("#sidebar");
    await expect(sidebar).toBeVisible();
  });
  
});
