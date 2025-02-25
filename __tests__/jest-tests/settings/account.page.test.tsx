import React from "react";
import { render, screen } from "@testing-library/react";
import AccountSettings from "@/app/(default)/settings/account/page";

// Dummy data podle typu DataForSession
const dummyUserData = {
  id: "1",
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  created_at: "2022-01-01T00:00:00.000Z",
  updated_at: "2022-01-01T00:00:00.000Z",
  avatar: "",
  access_token: "dummy_access",
  refresh_token: "dummy_refresh",
  expires: "2023-01-01T00:00:00.000Z",
  role: "user",
  username: "john_doe",
};

// Mock modulu next/headers – vracíme cookie se session hodnotou
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: "testcookie" })),
  })),
}));

// Mock modulu pro dešifrování session – vracíme dummy data
jest.mock("@/app/lib/session", () => ({
  decrypt: jest.fn(() => Promise.resolve({ payload: dummyUserData })),
}));

// Mock child komponent – SettingsSidebar
jest.mock('@/app/(default)/settings/settings-sidebar', () => () => <div>SettingsSidebar</div>);

// Mock child komponent – AccountPanel, předáme do ní userData pro kontrolu
jest.mock('@/app/(default)/settings/account/account-panel', () => ({ userData }: { userData: any }) => (
  <div>AccountPanel {JSON.stringify(userData)}</div>
));

describe("AccountSettings Page", () => {
  test("renders correctly", async () => {
    // Jelikož je AccountSettings asynchronní, nejprve vyčkejme na získání React elementu
    const page = await AccountSettings();
    render(page);

    // Ověříme, že se zobrazí hlavní titulek
    expect(screen.getByRole("heading", { name: "Nastavení" })).toBeInTheDocument();

    // Ověříme, že se zobrazí mocknuté child komponenty
    expect(screen.getByText("SettingsSidebar")).toBeInTheDocument();
    expect(screen.getByText(/AccountPanel/)).toBeInTheDocument();

    // Zkontrolujeme, že se do AccountPanel předala správná uživatelská data (např. first_name "John")
    expect(screen.getByText(/John/)).toBeInTheDocument();
  });
});
