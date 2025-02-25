import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedbackPanel from "@/app/(default)/settings/feedback/feedback-panel";
import { toast } from "react-toastify";

interface DataForSession {
    id: string | null;
    avatar: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    access_token: string | null;
    refresh_token: string | null;
    expires: number | null;
    expires_at: number | null;
    expiresAt: number | null;
}

// Dummy data pro uživatele
const dummyUserData: DataForSession = {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    avatar: "",
    access_token: "dummy_token",
    refresh_token: "dummy_refresh_token",
    expires: 1672531200000,
    expires_at: 1672531200000,
    expiresAt: 1672531200000,
  };
   
  

  
  // Mock modulu next/form – renderuje se jako obyčejný <form>
  jest.mock("next/form", () => ({
    __esModule: true,
    default: function Form({ children, ...props }: any) {
      return <form {...props}>{children}</form>;
    },
  }));
  
  // Mock hooku useActionState, který je importován z "react"
  jest.mock("react", () => {
    const actualReact = jest.requireActual("react");
    return {
      ...actualReact,
      useActionState: jest.fn(),
    };
  });
  import * as ReactModule from "react";
  const useActionStateMock = ReactModule.useActionState as jest.Mock;
  
  // Mock funkce, kterou hook vrací jako akční funkci
  const mockSendFeedbackAction = jest.fn();
  
  // Mock react-toastify
  jest.mock("react-toastify", () => ({
    toast: {
      dismiss: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
    },
  }));
  
  beforeEach(() => {
    jest.clearAllMocks();
    useActionStateMock.mockReturnValue([null, mockSendFeedbackAction, false]);
  });
  
  describe("FeedbackPanel", () => {
    test("renders correctly with default state", () => {
      render(<FeedbackPanel userData={dummyUserData} />);
      
      // Ověříme vykreslení nadpisu a popisu
      expect(screen.getByRole("heading", { name: /Zpětná vazba/i })).toBeInTheDocument();
      expect(
        screen.getByText(/Na uživatelské zkušenosti nám velmi záleží/i)
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Chtěl\/a bych zlepšit/i)).toBeInTheDocument();
      
      // Kontrola skrytého pole pro evaluation – výchozí hodnota je "3"
      const evaluationInput = document.querySelector(
        'input[name="evaluation"]'
      ) as HTMLInputElement;
      expect(evaluationInput).toBeInTheDocument();
      expect(evaluationInput.value).toBe("3");
      
      // Skrytá pole pro first_name a last_name obsahují data z dummyUserData
      const firstNameInput = document.querySelector(
        'input[name="first_name"]'
      ) as HTMLInputElement;
      const lastNameInput = document.querySelector(
        'input[name="last_name"]'
      ) as HTMLInputElement;
      expect(firstNameInput.value).toBe(dummyUserData.first_name);
      expect(lastNameInput.value).toBe(dummyUserData.last_name);
      
      // Při mountu se má zavolat toast.dismiss
      expect(toast.dismiss).toHaveBeenCalled();
    });
  
    test("updates evaluation state when evaluation button is clicked", async () => {
      render(<FeedbackPanel userData={dummyUserData} />);
      
      // Najdeme tlačítko, které obsahuje číslo "5" (v sr-only elementu)
      const button5 = screen.getByRole("button", { name: "5" });
      await userEvent.click(button5);
      
      // Skryté pole pro evaluation by nyní mělo mít hodnotu "5"
      const evaluationInput = document.querySelector(
        'input[name="evaluation"]'
      ) as HTMLInputElement;
      expect(evaluationInput.value).toBe("5");
    });
  
    test("updates feedback textarea on input change", async () => {
      render(<FeedbackPanel userData={dummyUserData} />);
      const textarea = screen.getByPlaceholderText(/Chtěl\/a bych zlepšit/i) as HTMLTextAreaElement;
      
      await userEvent.type(textarea, "Some feedback");
      expect(textarea.value).toBe("Some feedback");
    });
  
    test("resets feedback and evaluation when cancel button is clicked", async () => {
      render(<FeedbackPanel userData={dummyUserData} />);
      const textarea = screen.getByPlaceholderText(/Chtěl\/a bych zlepšit/i) as HTMLTextAreaElement;
      const button5 = screen.getByRole("button", { name: "5" });
      
      // Nastavíme odlišné hodnoty
      await userEvent.type(textarea, "Some feedback");
      await userEvent.click(button5);
      
      const evaluationInput = document.querySelector(
        'input[name="evaluation"]'
      ) as HTMLInputElement;
      expect(textarea.value).toBe("Some feedback");
      expect(evaluationInput.value).toBe("5");
      
      // Klikneme na tlačítko "Zrušit" – stav se resetuje
      const cancelButton = screen.getByRole("button", { name: /Zrušit/i });
      await userEvent.click(cancelButton);
      expect(textarea.value).toBe("");
      expect(evaluationInput.value).toBe("3");
    });
  
    test("calls toast.info when submit button is pressed", async () => {
      render(<FeedbackPanel userData={dummyUserData} />);
      const submitButton = screen.getByRole("button", { name: /Odeslat/i });
      await userEvent.click(submitButton);
      
      expect(toast.info).toHaveBeenCalledWith("Ukládám údaje.", {
        autoClose: 10000,
        hideProgressBar: false,
        theme: "dark",
      });
    });
  
    test("shows success toast when state.success becomes true", async () => {
      // První render s počátečním stavem
      useActionStateMock.mockReturnValueOnce([null, mockSendFeedbackAction, false]);
      const { rerender } = render(<FeedbackPanel userData={dummyUserData} />);
      
      // Simulujeme změnu stavu na úspěšný
      useActionStateMock.mockReturnValueOnce([{ success: true }, mockSendFeedbackAction, false]);
      rerender(<FeedbackPanel userData={dummyUserData} />);
      
      // Vyvoláme useEffect
      await act(async () => {});
      expect(toast.success).toHaveBeenCalledWith(
        "Údaje byly úspěšně uloženy.",
        expect.any(Object)
      );
    });
  
    test("shows error toast when state.success becomes false", async () => {
      useActionStateMock.mockReturnValueOnce([null, mockSendFeedbackAction, false]);
      const { rerender } = render(<FeedbackPanel userData={dummyUserData} />);
      
      // Simulujeme chybový stav
      useActionStateMock.mockReturnValueOnce([{ success: false }, mockSendFeedbackAction, false]);
      rerender(<FeedbackPanel userData={dummyUserData} />);
      
      await act(async () => {});
      expect(toast.error).toHaveBeenCalledWith(
        "Něco se pokazilo. Zkuste to prosím znovu.",
        expect.any(Object)
      );
    });
  });
  
