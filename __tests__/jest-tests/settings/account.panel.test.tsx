// Ujistěte se, že tento mock je nejdříve, než se importují další moduly!
jest.mock("react-toastify", () => ({
    toast: {
      dismiss: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
    },
  }));
  
  import React from "react";
  import { render, screen, act } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import AccountPanel from "@/app/(default)/settings/account/account-panel";
  import { toast } from "react-toastify";
  import { redirect } from "next/navigation";
  import { logout } from "@/actions";
  
  // Mock next/form – renderuje se jako obyčejný <form>
  jest.mock("next/form", () => ({
    __esModule: true,
    default: function Form({ children, ...props }: any) {
      return <form {...props}>{children}</form>;
    },
  }));
  
  // Mock hooku useActionState importovaného z "react"
  jest.mock("react", () => {
    const actualReact = jest.requireActual("react");
    return {
      ...actualReact,
      useActionState: jest.fn(),
    };
  });
  import * as ReactModule from "react";
  const useActionStateMock = ReactModule.useActionState as jest.Mock;
  
  // Mock ikon
  jest.mock("@/components/my-icons/double-check-icon", () => () => (
    <span data-testid="double-check-icon" />
  ));
  jest.mock("@/components/my-icons/cross-icon", () => () => (
    <span data-testid="cross-icon" />
  ));
  
  // Mock UpdateAvatar – zobrazí jednoduchý div s testovacím ID
  jest.mock("@/components/users/update-avatar", () => ({
    __esModule: true,
    default: ({ photo, setUpdatedAvatarAction }: { photo: string; setUpdatedAvatarAction: (s: string) => void }) => (
      <div data-testid="update-avatar">UpdateAvatar: {photo}</div>
    ),
  }));
  
  // Mock akcí updateProfile a logout
  jest.mock("@/actions", () => ({
    updateProfile: jest.fn(),
    logout: jest.fn(),
  }));
  
  // Mock next/navigation – pro funkci redirect
  jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
  }));
  
  // Dummy data podle typu DataForSession
  const dummyUserData = {
    id: "1",
    avatar: "699729d7-e5fb-48e8-930c-6510fc06eb03",
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    access_token: "dummy_access",
    refresh_token: "dummy_refresh",
    expires: 1672531199,
    expires_at: 1672531199,
    expiresAt: 1672531199,
  };
  
  // Funkce, kterou hook useActionState vrací jako updateProfileAction
  const mockUpdateProfileAction = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Výchozí návratová hodnota hooku: state null a akce
    useActionStateMock.mockReturnValue([null, mockUpdateProfileAction]);
  });
  
  describe("AccountPanel", () => {
    test("renders correctly with default state", () => {
      render(<AccountPanel userData={dummyUserData} />);
      
      // Kontrola nadpisu
      expect(screen.getByRole("heading", { name: /Můj účet/i })).toBeInTheDocument();
      
      // Kontrola základních informací
      const firstNameInput = screen.getByLabelText(/Jméno/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/Příjmení/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/^Email$/i) as HTMLInputElement;
      expect(firstNameInput.value).toBe(dummyUserData.first_name);
      expect(lastNameInput.value).toBe(dummyUserData.last_name);
      expect(emailInput.value).toBe(dummyUserData.email);
      
      // Kontrola komponenty pro update avatar
      expect(screen.getByTestId("update-avatar")).toHaveTextContent(
        `UpdateAvatar: ${dummyUserData.avatar}`
      );
      
      // Kontrola, že input pro aktuální heslo je prázdný
      const oldPasswordInput = screen.getByLabelText(/Aktuální heslo/i) as HTMLInputElement;
      expect(oldPasswordInput.value).toBe("");
    });
    
    test("disables submit button when old password is empty", () => {
      render(<AccountPanel userData={dummyUserData} />);
      const submitButton = screen.getByRole("button", { name: /Uložit změny/i });
      expect(submitButton).toBeDisabled();
    });
    
    test("enables submit button when valid password conditions are met", async () => {
      render(<AccountPanel userData={dummyUserData} />);
      
      const oldPasswordInput = screen.getByLabelText(/Aktuální heslo/i) as HTMLInputElement;
      await userEvent.type(oldPasswordInput, "oldPass");
      const newPasswordInput = screen.getByLabelText(/^Nové heslo$/i) as HTMLInputElement;
      const newPasswordCheckInput = screen.getByLabelText(/^Zadejte znovu nové heslo$/i) as HTMLInputElement;
      await userEvent.clear(newPasswordInput);
      await userEvent.type(newPasswordInput, "Abc1");
      await userEvent.clear(newPasswordCheckInput);
      await userEvent.type(newPasswordCheckInput, "Abc1");
      
      const submitButton = screen.getByRole("button", { name: /Uložit změny/i });
      expect(submitButton).not.toBeDisabled();
    });
    
    test("calls toast.info when submit button is pressed", async () => {
      render(<AccountPanel userData={dummyUserData} />);
      
      const oldPasswordInput = screen.getByLabelText(/Aktuální heslo/i) as HTMLInputElement;
      await userEvent.type(oldPasswordInput, "oldPass");
      const newPasswordInput = screen.getByLabelText(/^Nové heslo$/i) as HTMLInputElement;
      const newPasswordCheckInput = screen.getByLabelText(/^Zadejte znovu nové heslo$/i) as HTMLInputElement;
      await userEvent.clear(newPasswordInput);
      await userEvent.type(newPasswordInput, "Abc1");
      await userEvent.clear(newPasswordCheckInput);
      await userEvent.type(newPasswordCheckInput, "Abc1");
      
      const submitButton = screen.getByRole("button", { name: /Uložit změny/i });
      await userEvent.click(submitButton);
      
      const toastInfoMock = toast.info as unknown as jest.Mock;
      expect(toastInfoMock).toHaveBeenCalledWith("Ukládám údaje.", {
        autoClose: 10000,
        hideProgressBar: false,
        theme: "dark",
      });
    });
    
    test("updates password validation indicators when new password is typed", async () => {
        render(<AccountPanel userData={dummyUserData} />);
        
        const newPasswordInput = screen.getByLabelText(/^Nové heslo$/i) as HTMLInputElement;
        const newPasswordCheckInput = screen.getByLabelText(/^Zadejte znovu nové heslo$/i) as HTMLInputElement;
        
        // Zadáme neplatné heslo "abcde" (chybí velká písmena a číslice)
        await userEvent.clear(newPasswordInput);
        await userEvent.type(newPasswordInput, "abcde");
        
        // Ověříme, že "Velká písmena" je červená
        const upperCaseItem = screen.getByText(/Velká písmena/i, { selector: "li" });
        expect(upperCaseItem).toHaveClass("text-red-600");
        
        // Pro "Malá písmena" vybereme seznamovou položku
        const lowerCaseItems = screen.getAllByText(/Malá písmena/i, { selector: "li" });
        const lowerCaseValidation = lowerCaseItems[0];
        expect(lowerCaseValidation).toBeDefined();
        // Protože heslo "abcde" obsahuje malá písmena, očekáváme zelenou barvu:
        expect(lowerCaseValidation).toHaveClass("text-green-600");
        
        // Pro "Číslice" vybereme seznamovou položku
        const digitItems = screen.getAllByText(/Číslice/i, { selector: "li" });
        const digitItem = digitItems[0];
        expect(digitItem).toHaveClass("text-red-600");
        
        // Původně není zadáno nové heslo pro kontrolu shody – tedy by se mělo zobrazit varování
        expect(screen.getByText(/Zadaná hesla nejsou shodná/i, { selector: "li" })).toHaveClass("text-red-600");
        
        // Zadáme validní heslo "Abc1"
        await userEvent.clear(newPasswordInput);
        await userEvent.type(newPasswordInput, "Abc1");
        expect(screen.getByText(/Velká písmena/i, { selector: "li" })).toHaveClass("text-green-600");
        const lowerCaseValidItems = screen.getAllByText(/Malá písmena/i, { selector: "li" });
        const lowerCaseValid = lowerCaseValidItems[0];
        expect(lowerCaseValid).toHaveClass("text-green-600");
        expect(screen.getByText(/Číslice/i, { selector: "li" })).toHaveClass("text-green-600");
        
        // Zadáme stejné heslo do kontrolního pole
        await userEvent.clear(newPasswordCheckInput);
        await userEvent.type(newPasswordCheckInput, "Abc1");
        expect(screen.getByText(/Zadaná hesla jsou shodná/i, { selector: "li" })).toHaveClass("text-green-600");
      });
      
    
    test("shows success toast, calls logout and redirect when state.success becomes true", async () => {
      useActionStateMock.mockReturnValueOnce([null, mockUpdateProfileAction]);
      const { rerender } = render(<AccountPanel userData={dummyUserData} />);
      
      // Simulace změny stavu – úspěch
      useActionStateMock.mockReturnValueOnce([{ success: true }, mockUpdateProfileAction]);
      rerender(<AccountPanel userData={dummyUserData} />);
      
      await act(async () => {}); // Uvolnění useEffect
      
      const toastSuccessMock = toast.success as unknown as jest.Mock;
      expect(toastSuccessMock).toHaveBeenCalledWith("Údaje byly úspěšně uloženy.", expect.any(Object));
      const logoutMock = logout as unknown as jest.Mock;
      const redirectMock = redirect as unknown as jest.Mock;
      expect(logoutMock).toHaveBeenCalled();
      expect(redirectMock).toHaveBeenCalledWith("/signin");
    });
    
    test("shows error toast when state.success becomes false", async () => {
      useActionStateMock.mockReturnValueOnce([null, mockUpdateProfileAction]);
      const { rerender } = render(<AccountPanel userData={dummyUserData} />);
      
      // Simulace chyby
      useActionStateMock.mockReturnValueOnce([{ success: false }, mockUpdateProfileAction]);
      rerender(<AccountPanel userData={dummyUserData} />);
      
      await act(async () => {});
      const toastErrorMock = toast.error as unknown as jest.Mock;
      expect(toastErrorMock).toHaveBeenCalledWith("Něco se pokazilo. Zkuste to prosím znovu.", expect.any(Object));
    });
  });
  