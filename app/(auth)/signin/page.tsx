"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/actions";
import Link from "next/link";
import { Button } from "@heroui/react";
import AuthHeader from "../auth-header";
import AuthImage from "../auth-image";
import CookieConsentModal from "./cookie-consent-modal";

type LoginResponse = {
  success?: boolean;
  errors?: Record<string, string[]>;
};

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard"; // Defaultně přesměrujeme na /dashboard

  const [state, loginAction, isPending] = useActionState(
    async (prevState: LoginResponse | undefined, formData: FormData): Promise<LoginResponse> => {
      return await login(prevState ?? {}, formData);
    },
    undefined
  );

  // Přesměrování po úspěšném přihlášení
  useEffect(() => {
    if (state?.success) {
      router.push(redirectUrl);
    }
  }, [state, router, redirectUrl]);

  return (
    <main className="bg-white dark:bg-zinc-950">
      <div className="relative md:flex">
        {/* Content */}
        <div className="md:w-1/2">
          <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">
            <AuthHeader />
            <div className="max-w-sm mx-auto w-full px-4 py-4">
              <h1 className="text-3xl text-zinc-800 dark:text-zinc-100 font-bold mb-6">
                Vítejte zpět 👋
              </h1>

              {/* Form */}
              <form action={loginAction}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">
                      Email
                    </label>
                    <input id="email" className="form-input w-full" type="email" name="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                      Heslo
                    </label>
                    <input id="password" className="form-input w-full" type="password" name="password" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="mr-1">
                    <Link className="text-sm underline hover:no-underline" href="/reset-password">
                      Zapomenuté heslo?
                    </Link>
                  </div>
                  <Button disabled={isPending} type="submit" color="primary" variant="flat">
                    {isPending ? "Přihlašuji..." : "Login"}
                  </Button>
                </div>
              </form>

              {/* Chybové zprávy */}
              {state?.errors && (
                <div className="mt-4 text-red-500 text-sm">
                  {Object.values(state.errors).map((errorList, index) => (
                    <p key={index}>{errorList.join(", ")}</p>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="pt-5 mt-6 border-t border-zinc-200 dark:border-zinc-700">
                <div className="text-sm">
                  Ještě nemáte účet?{" "}
                  <Link className="font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400" href="/signup">
                    Registrujte se
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AuthImage />
      </div>
      {/* Modal */}
      <CookieConsentModal />
    </main>
  );
}
