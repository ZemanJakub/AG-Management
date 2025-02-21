"use client";

import { useActionState } from "react";
import { useEffect, useState, startTransition, FormEvent, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/actions";
import Link from "next/link";
import { Button, Input } from "@heroui/react";
import { EyeSlashFilledIcon } from "@/components/my-icons/eye-slash-icon";
import { EyeFilledIcon } from "@/components/my-icons/eye-filled-icon";

type LoginResponse = {
  success?: boolean;
  message?: string;
};

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  // Uchováváme hodnoty formuláře v lokálním stavu
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [localErrors, setLocalErrors] = useState<string| null>(null);

  // Funkce validující email – vrací true, pokud je email platný
  const validateEmail = (value: string) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);

  // Stav, který určuje, zda je email neplatný
  const isInvalidEmail = useMemo(() => {
    if (email === "") return false;
    return !validateEmail(email);
  }, [email]);

  const [state, loginAction, isPending] = useActionState(
    async (prevState: LoginResponse | undefined, formData: FormData): Promise<LoginResponse> => {
      return await login(prevState ?? {}, formData);
    },
    undefined
  );

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-sm w-full px-4 py-4">
          <h1 className="text-3xl text-zinc-800 dark:text-zinc-100 font-bold mb-6">
            Vítejte zpět 👋
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  classNames={{
                    input:
                      "border-none focus:ring-0 focus:outline-none bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-md p-2",
                  }}
                  errorMessage={
                    isInvalidEmail
                      ? "Zadejte platný email"
                      : localErrors
                      ? localErrors
                      : undefined
                  }
                  isInvalid={isInvalidEmail || Boolean(localErrors)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="password">
                  Heslo
                </label>
                <Input
                  id="password"
                  type={isVisible ? "text" : "password"}
                  name="password"
                  className="w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  classNames={{
                    input:
                      "border-none focus:ring-0 focus:outline-none rounded-md p-2",
                  }}
                  errorMessage={
                    localErrors? localErrors : undefined
                  }
                  isInvalid={Boolean(localErrors)}
                  endContent={
                    <button
                      aria-label="toggle password visibility"
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {!isVisible ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <Link className="text-sm underline hover:no-underline" href="/reset-password">
                Zapomenuté heslo?
              </Link>
              <Button
                data-testid="login-button"
                disabled={isPending || isInvalidEmail}
                type="submit"
                color="primary"
                variant="flat"
              >
                {isPending ? "Přihlašuji..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
