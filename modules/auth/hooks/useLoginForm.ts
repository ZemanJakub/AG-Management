// src/modules/auth/hooks/useLoginForm.ts
import { useEffect, useState, useMemo, FormEvent, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login } from "@/actions";

type LoginResponse = {
  success?: boolean;
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
};

/**
 * Custom hook pro zpracování přihlašovacího formuláře
 * @returns Stav a metody pro práci s přihlašovacím formulářem
 */
export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  // Uchováváme hodnoty formuláře v lokálním stavu
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [localErrors, setLocalErrors] = useState<string | null>(null);
  const [hasBlurredEmail, setHasBlurredEmail] = useState(false);

  // Funkce validující email – vrací true, pokud je email platný
  const validateEmail = (value: string) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);

  // Stav pro neplatný email – validuje se až po opuštění pole
  const isInvalidEmail = useMemo(() => {
    if (!hasBlurredEmail) return false; // Nevaliduje se, dokud uživatel neklikne pryč
    return !validateEmail(email);
  }, [email, hasBlurredEmail]);

  const isEmptyEmail = useMemo(() => {
    if (email === "") return true;
    return false;
  }, [email]);

  // Použití useActionState se stejnými parametry jako v původní komponentě
  const [state, loginAction, isPending] = useActionState(
    async (prevState: LoginResponse | undefined, formData: FormData): Promise<LoginResponse> => {
      return await login(prevState ?? {}, formData);
    },
    undefined
  );

  // Stejný effect jako v původní komponentě pro zpracování odpovědi ze serveru
  useEffect(() => {
    if (state?.success) {
      router.push(redirectUrl);
    }
    if (state?.message) {
      setLocalErrors(state.message);
    }
  }, [state, router, redirectUrl]);

  // Pokud uživatel mění hodnoty, vymažeme předchozí chyby
  useEffect(() => {
    if (email || password) {
      setLocalErrors(null);
    }
  }, [email, password]);

  // Submit handler s vyčištěním chyb před odesláním
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Reset chyb před odesláním formuláře
    setLocalErrors(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    startTransition(() => {
      loginAction(formData);
    });
  };

  const toggleVisibility = () => setIsVisible(!isVisible);
  const handleBlurEmail = () => setHasBlurredEmail(true);

  // Vracíme všechny stavy a metody, které komponenta potřebuje
  return {
    // Stavy
    email,
    password,
    isVisible,
    localErrors,
    isInvalidEmail,
    isEmptyEmail,
    isPending,
    state,
    
    // Settery
    setEmail,
    setPassword,
    
    // Metody
    toggleVisibility,
    handleBlurEmail,
    handleSubmit
  };
}