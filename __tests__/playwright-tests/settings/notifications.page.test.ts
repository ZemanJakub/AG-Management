import { test, expect } from '@playwright/test';

test.describe('Notifications Settings Page', () => {
    // ... (předchozí testy)

    test('should display elements correctly', async ({ page }) => {
        // Ověříme, že se zobrazuje nadpis "Oznámení"
        await expect(page.locator('h2', { hasText: 'Oznámení' })).toBeVisible();

        // Ověříme, že se zobrazují sekce "Push notifikace" a "Notifikace v aplikaci"
        await expect(page.locator('h3', { hasText: 'Push notifikace' })).toBeVisible();
        await expect(page.locator('h3', { hasText: 'Notifikace v aplikaci' })).toBeVisible();

        // Ověříme, že se zobrazují všechny prvky v sekci "Push notifikace"
        await expect(page.locator('label[for="push-notifications"]')).toBeVisible(); // Předpokládáme, že switch má id="push-notifications"
        await expect(page.locator('button', { hasText: 'Odeslat' })).toBeVisible();

        // Ověříme, že se zobrazují všechny prvky v sekci "Notifikace v aplikaci"
        await expect(page.locator('button', { hasText: 'Smazat' })).toBeVisible();

        // Ověříme, že se zobrazuje tlačítko "Uložit změny"
        await expect(page.locator('button', { hasText: 'Uložit změny' })).toBeVisible();
    });

 
});