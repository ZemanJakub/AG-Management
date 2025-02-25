import React from "react";
import { render, screen } from "@testing-library/react";
import FeedbackSettings from "@/app/(default)/settings/feedback/page";

// Mock modulu next/headers pro cookies
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: "testcookie" })),
  })),
}));

// Mock modulu pro dešifrování session
jest.mock("@/app/lib/session", () => ({
  decrypt: jest.fn(() =>
    Promise.resolve({ payload: { user: "Test User", id: 1 } })
  ),
}));

// Mock child komponent: SettingsSidebar
jest.mock('@/app/(default)/settings/settings-sidebar', () => () => <div>SettingsSidebar</div>);

// Mock child komponent: FeedbackPanel – předáme uživatelská data pro ověření
jest.mock("@/app/(default)/settings/feedback/feedback-panel", () => ({ userData }: { userData: any }) => (
  <div>FeedbackPanel {JSON.stringify(userData)}</div>
));

describe("FeedbackSettings Page", () => {
  it("renders the page correctly", async () => {
    // Jelikož je FeedbackSettings asynchronní, nejprve získáme React element
    const page = await FeedbackSettings();
    render(page);

    // Ověříme, že se vykreslí hlavní titulek stránky
    expect(screen.getByText("Nastavení")).toBeInTheDocument();

    // Ověříme, že se vykreslí mocknuté child komponenty
    expect(screen.getByText("SettingsSidebar")).toBeInTheDocument();
    expect(screen.getByText(/FeedbackPanel/)).toBeInTheDocument();

    // Ověříme, že se do FeedbackPanel předala očekávaná data (např. "Test User")
    expect(screen.getByText(/Test User/)).toBeInTheDocument();
  });
});
