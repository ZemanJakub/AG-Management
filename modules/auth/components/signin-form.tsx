"use client";

import Link from "next/link";
import { Button, Input } from "@heroui/react";
import { motion } from "framer-motion";

import AuthHeader from "./auth-header";
import { EyeFilledIcon } from "@/modules/shared/components/icons/eye-filled-icon";
import { EyeSlashFilledIcon } from "@/modules/shared/components/icons/eye-slash-icon";
import { useLoginForm } from "@/modules/auth/hooks/useLoginForm";
import { formStyles } from "@/modules/shared/styles/form-styles";

export default function SignInForm() {
  // Použití našeho custom hooku pro veškerou logiku formuláře
  const {
    email,
    password,
    isVisible,
    localErrors,
    isInvalidEmail,
    isEmptyEmail,
    isPending,
    state,
    setEmail,
    setPassword,
    toggleVisibility,
    handleBlurEmail,
    handleSubmit
  } = useLoginForm();

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
                  className={formStyles.label}
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
                  onBlur={handleBlurEmail}
                  classNames={formStyles.input.classNames}
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
                  className={formStyles.label}
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
                  classNames={formStyles.password.classNames}
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
                className={formStyles.link}
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
                className={formStyles.button}
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
