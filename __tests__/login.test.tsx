import { render, screen } from "@testing-library/react";
import SignIn from "@/app/(auth)/signin/page";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/actions", () => ({
  login: jest.fn(),
}));

jest.mock("@/app/auth-header", () => () => <div data-testid="auth-header" />);
jest.mock("@/app/auth-image", () => () => <div data-testid="auth-image" />);
jest.mock("@/app/signin/cookie-consent-modal", () => () => (
  <div data-testid="cookie-consent-modal" />
));

describe("SignIn Page", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useSearchParams as jest.Mock).mockReturnValue({ get: jest.fn(() => null) });
  });

  test("zobrazí nadpis stránky", () => {
    render(<SignIn />);
    expect(
      screen.getByRole("heading", { name: /Vítejte zpět 👋/i })
    ).toBeInTheDocument();
  });

  test("zobrazí pole pro e-mail", () => {
    render(<SignIn />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  test("zobrazí pole pro heslo", () => {
    render(<SignIn />);
    expect(screen.getByLabelText(/heslo/i)).toBeInTheDocument();
  });

  test("zobrazí tlačítko pro přihlášení", () => {
    render(<SignIn />);
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
  });

  test("zobrazí odkaz na reset hesla", () => {
    render(<SignIn />);
    expect(
      screen.getByRole("link", { name: /Zapomenuté heslo\?/i })
    ).toBeInTheDocument();
  });

  test("zobrazí odkaz na registraci", () => {
    render(<SignIn />);
    expect(
      screen.getByRole("link", { name: /Registrujte se/i })
    ).toBeInTheDocument();
  });

  test("zobrazí komponentu AuthHeader", () => {
    render(<SignIn />);
    expect(screen.getByTestId("auth-header")).toBeInTheDocument();
  });

  test("zobrazí komponentu AuthImage", () => {
    render(<SignIn />);
    expect(screen.getByTestId("auth-image")).toBeInTheDocument();
  });

  test("zobrazí modal s cookie souhlasem", () => {
    render(<SignIn />);
    expect(screen.getByTestId("cookie-consent-modal")).toBeInTheDocument();
  });
});
