"use client";

import './css/style.css';
import "react-image-crop/dist/ReactCrop.css";

import { Inter } from 'next/font/google';
import ThemeProvider from './theme-provider';
import AppProvider from './app-provider';
import { SubscriptionProvider } from "./subscription-context";
import ToastProvider from "./toast-provider";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Načteme téma z localStorage nebo systémového nastavení
  const [theme, setTheme] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Získáme uživatelské nastavení z localStorage
    const storedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    // Nastavíme téma podle uživatelského nastavení
    setTheme(storedTheme || systemTheme);
  }, []);

  return (
    <html
      lang="en"
      data-theme={theme || "light"} // Zajistíme, že server i klient mají stejnou hodnotu
      className={`${inter.variable} ${theme === "dark" ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <body className="font-inter antialiased bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <ThemeProvider>
          <ToastProvider>
            <AppProvider>
              <SubscriptionProvider>
                {children}
              </SubscriptionProvider>
            </AppProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
