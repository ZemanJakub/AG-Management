import './css/style.css'
import "react-image-crop/dist/ReactCrop.css";

import { Inter } from 'next/font/google'
import Theme from './theme-provider'
import AppProvider from './app-provider'
import { SubscriptionProvider } from "./subscription-context";
import ToastProvider from "./toast-provider";
// import {HeroUIProvider} from "@heroui/react";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: "AG-NEXT",
  description: "Úvodní stránka AG -NEXT",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>{/* suppressHydrationWarning: https://github.com/vercel/next.js/issues/44343 */}
      <body className="font-inter antialiased bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
      {/* <HeroUIProvider> */}
      <SubscriptionProvider>
          <Theme>
            <ToastProvider>
            <AppProvider>{children}</AppProvider>
            </ToastProvider>
          </Theme>
        </SubscriptionProvider>
        {/* </HeroUIProvider> */}
      </body>
    </html>
  )
}
