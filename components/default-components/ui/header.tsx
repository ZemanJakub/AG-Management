"use client";

import { useAppProvider } from "@/app/app-provider";
import Notifications from "@/components/default-components/dropdown-notifications";
import ThemeToggle from "@/components/default-components/theme-toggle";
import DropdownProfile from "@/components/default-components/dropdown-profile";
import SubscriptionManager from "@/app/lib/subscription-manager";

interface HeaderProps {
  userName: string;
  userId: string;
  variant?: "default" | "v2" | "v3";
  avatar: string;
}

export default function Header({
  userName,
  userId,
  variant,
  avatar,
}: HeaderProps) {
  const { sidebarOpen, setSidebarOpen } = useAppProvider();

  return (
    <header
      className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-black before:-z-10 z-30 ${
        variant === "v2" || variant === "v3"
          ? "before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10"
          : "max-lg:shadow-sm lg:before:bg-gray-50/90 dark:lg:before:bg-black" // Changed bg-gray-100 to bg-gray-50 and bg-gray-900 to bg-gray-950
      } ${variant === "v2" ? "dark:before:bg-gray-800" : ""} ${
        variant === "v3" ? "dark:before:bg-gray-900" : ""
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between h-16 ${
            variant === "v2" || variant === "v3"
              ? ""
              : "lg:border-b border-gray-200 dark:border-gray-700/60"
          }`}
        >
          {/* Header: Left side */}
          <div className="flex">
            {/* Hamburger button */}
            <button
              id="sidebarHeaderButton"
              className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="w-6 h-6 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            <Notifications align="right" userId={userId} />
            <ThemeToggle />
            <SubscriptionManager />
            {/*  Divider */}
            <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
            <DropdownProfile
              align="right"
              userName={userName}
              avatar={avatar}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
