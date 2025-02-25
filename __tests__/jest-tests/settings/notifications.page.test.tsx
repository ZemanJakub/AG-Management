import React from "react";
import { render, screen } from "@testing-library/react";

// Mock child komponent před importem testované komponenty
jest.mock('@/app/(default)/settings/settings-sidebar', () => () => <div>SettingsSidebar</div>);
jest.mock('@/app/(default)/settings/notifications/notifications-panel', () => () => <div>NotificationsPanel</div>);

import NotificationsSettings from "@/app/(default)/settings/notifications/page";

describe("NotificationsSettings Page", () => {
  it("renders the page correctly", () => {
    render(<NotificationsSettings />);

    // Ověříme, že se na stránce objeví hlavní titulek "Nastavení"
    expect(screen.getByText(/Nastavení/i)).toBeInTheDocument();

    // Ověření přítomnosti mocknutých child komponent
    expect(screen.getByText("SettingsSidebar")).toBeInTheDocument();
    expect(screen.getByText("NotificationsPanel")).toBeInTheDocument();
  });
});
