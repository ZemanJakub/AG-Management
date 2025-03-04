"use client";

import { useActionState } from "react";
import {
  useEffect,
  useState,
  startTransition,
  FormEvent,
  useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button, Input } from "@heroui/react";
import { motion } from "framer-motion";

import { login } from "@/actions";
import AuthHeader from "./auth-header";
import { EyeFilledIcon } from "@/modules/shared/components/icons/eye-filled-icon";
import { EyeSlashFilledIcon } from "@/modules/shared/components/icons/eye-slash-icon";

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

  const [state, loginAction, isPending] = useActionState(
    async (
      prevState: LoginResponse | undefined,
      formData: FormData
    ): Promise<LoginResponse> => {
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
    <div className="flex flex-col h-full mx-9 mb-10">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-sm w-full px-4 py-4">
          <AuthHeader />
          <h1 className="text-3xl text-zinc-800 dark:text-zinc-100 font-bold mb-6">
            Vítejte zpět{" "}
            <motion.div
              className="inline-block w-12"
              initial={{ rotateZ: 0 }}
              animate={{
                rotateZ: [
                  0, -20, 20, -20, 20, -20, 0,
                ],
              }}
              transition={{ duration: 3, delay: 1 }}
            >
              👋
            </motion.div>
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setHasBlurredEmail(true)} // Nastaví validaci po prvním opuštění
                  classNames={{
                    input:
                      "border-none focus:ring-0 focus:outline-none bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-md p-2",
                    mainWrapper:
                      "border border-1 border-secondary rounded-md dark: border-none",
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
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="password"
                >
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
                    mainWrapper:
                      "border border-1 border-secondary rounded-md dark: border-none",
                  }}
                  errorMessage={localErrors ? localErrors : undefined}
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
            <div className="flex items-center justify-between mt-12">
              <Link
                className="text-sm underline hover:no-underline"
                href="/reset-password"
              >
                Zapomenuté heslo?
              </Link>

              <Button
                data-testid="login-button"
                disabled={isPending || isInvalidEmail || isEmptyEmail}
                type="submit"
                color={
                  !isInvalidEmail && !isEmptyEmail ? "secondary" : "default"
                }
                variant="shadow"
                className="w-1/3"
              >
                {isPending || state?.success ? "Přihlašuji..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
