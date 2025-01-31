"use client";

import Link from "next/link";
import Image from "next/image";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { logout } from "@/actions/auth/actions";

interface HeaderProps {
  userName: string;
  align?: "left" | "right";
  avatar: string;
}

export default function DropdownProfile({userName, avatar }: HeaderProps) {
  return (
    <div className="relative inline-flex">
      <Dropdown className="bg-gray-200 dark:bg-gray-800">
        <DropdownTrigger>
          <Button 
          variant="light"
          className="inline-flex justify-center items-center group">
            <Image
              className="w-8 h-8 rounded-full"
              src={`https://directus.aglikace.cz/assets/${avatar}`}
              width={32}
              height={32}
              alt="User"
            />
            <div className="flex items-center truncate">
              <span className="truncate ml-2 text-sm font-medium dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                {userName}
              </span>
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="User menu"
          className="z-10"
        >
          <DropdownItem key="settings">
            <Link
              href="/settings/account"
              className="font-medium text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-500"
            >
              Nastavení
            </Link>
          </DropdownItem>
          <DropdownItem key="logout" onPress={logout}>
            <span className="font-medium text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-500">
              Odhlásit se
            </span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
