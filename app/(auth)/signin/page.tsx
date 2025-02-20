"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/actions";
import Link from "next/link";
import { Button } from "@heroui/react";
import AuthHeader from "../auth-header";
import CookieConsentModal from "./cookie-consent-modal";
import AuthImage from "../auth-image";

type LoginResponse = {
  success?: boolean;
  errors?: Record<string, string[]>;
};

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

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
  }, [state, router, redirectUrl]);

  return (
    <main className="relative min-w-full min-h-screen">
      {/* Pozadí: obrázek přes celou obrazovku */}
      <AuthImage />
      <div className="relative min-w-full" id="kuku">
        <div className="w-full">
          <div className="min-h-[100dvh] h-full min-w-full flex flex-col after:flex-1">
            <AuthHeader />
            <div className="max-w-sm mx-auto w-full px-4 py-4">
              <h1 className="text-3xl text-zinc-800 dark:text-zinc-100 font-bold mb-6 mx-9 md:mx-0">
                Vítejte zpět 👋
              </h1>
              <form action={loginAction}>
                <div className="space-y-4 mx-9 md:mx-0">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      className="form-input w-full"
                      type="email"
                      name="email"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="password"
                    >
                      Heslo
                    </label>
                    <input
                      id="password"
                      className="form-input w-full"
                      type="password"
                      name="password"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 mx-9 md:mx-0">
                  <div className="mr-1">
                    <Link
                      className="text-sm underline hover:no-underline"
                      href="/reset-password"
                    >
                      Zapomenuté heslo?
                    </Link>
                  </div>
                  <Button
                    data-testid="login-button"
                    disabled={isPending}
                    type="submit"
                    color="primary"
                    variant="flat"
                  >
                    {isPending ? "Přihlašuji..." : "Login"}
                  </Button>
                </div>
              </form>
              {state?.errors && (
                <div className="mt-4 text-red-500 text-sm">
                  {Object.values(state.errors).map((errorList, index) => (
                    <p key={index}>{errorList.join(", ")}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CookieConsentModal />
    </main>
  );
}
