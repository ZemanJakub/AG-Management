import { render, screen } from "@testing-library/react";
import SettingsSidebar from "app/(default)/settings/settings-sidebar"
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("SettingsSidebar", () => {
  it("renders correctly", () => {
    (usePathname as jest.Mock).mockReturnValue("/settings/account");
    render(<SettingsSidebar />);

    expect(screen.getByText("Můj účet")).toBeInTheDocument();
    expect(screen.getByText("Notifikace")).toBeInTheDocument();
    expect(screen.getByText("Aplikace")).toBeInTheDocument();
    expect(screen.getByText("Zpětná vazba")).toBeInTheDocument();
  });

  it("applies active class when pathname matches", () => {
    (usePathname as jest.Mock).mockReturnValue("/settings/account");
    render(<SettingsSidebar />);
    
    const activeLink = screen.getByText("Můj účet").closest("a");
    expect(activeLink).toHaveClass("bg-[linear-gradient(135deg,var(--tw-gradient-stops))]");
  });

  it("does not apply active class when pathname does not match", () => {
    (usePathname as jest.Mock).mockReturnValue("/settings/other");
    render(<SettingsSidebar />);
    
    const inactiveLink = screen.getByText("Můj účet").closest("a");
    expect(inactiveLink).not.toHaveClass("bg-[linear-gradient(135deg,var(--tw-gradient-stops))]");
  });

  it("contains correct navigation links", () => {
    render(<SettingsSidebar />);

    expect(screen.getByRole("link", { name: /můj účet/i })).toHaveAttribute("href", "/settings/account");
    expect(screen.getByRole("link", { name: /notifikace/i })).toHaveAttribute("href", "/settings/notifications");
    expect(screen.getByRole("link", { name: /aplikace/i })).toHaveAttribute("href", "/settings/apps");
    expect(screen.getByRole("link", { name: /zpětná vazba/i })).toHaveAttribute("href", "/settings/feedback");
  });
});
