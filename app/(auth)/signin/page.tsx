"use client";

import Link from "next/link";
import AuthHeader from "../auth-header";
import AuthImage from "../auth-image";
import { useActionState } from "react";
import { login } from "@/actions/auth/actions";
import { Button } from "@nextui-org/react";
import { useFormStatus } from "react-dom";
import CookieConsentModal from "./cookie-consent-modal ";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" color="primary" variant="flat">
      Login
    </Button>
  );
}

export default function SignIn() {
  const [state, loginAction] = useActionState(login, undefined);

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
                      autoComplete="on"
                      name="password"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="mr-1">
                    <Link
                      className="text-sm underline hover:no-underline"
                      href="/reset-password"
                    >
                      Zapomenuté heslo?
                    </Link>
                  </div>
                  <SubmitButton />
                </div>
              </form>
              {/* Footer */}
              <div className="pt-5 mt-6 border-t border-zinc-200 dark:border-zinc-700">
                <div className="text-sm">
                  Ještě nemáte účet?{" "}
                  <Link
                    className="font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                    href="/signup"
                  >
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