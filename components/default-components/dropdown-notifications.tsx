"use client";

import Link from 'next/link';
import useSWR from 'swr';
import { fetchNotifcations } from '@/queries/notifications';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem, Button, cn } from "@heroui/react";
import { NotificationData } from "@/app/lib/models";

interface DropdownNotificationsProps {
  align?: 'left' | 'right';
  userId: string;
}

// Ikonka pro notifikace
const NotificationIcon = (props:any) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11c0-3.31-2.69-6-6-6S6 7.69 6 11v5l-2 2v1h16v-1l-2-2Z" fill="currentColor" />
  </svg>
);

export default function DropdownNotifications({ align = 'left', userId }: DropdownNotificationsProps) {
  const { data, error } = useSWR<NotificationData[]>(userId, fetchNotifcations);

  if (!data && !error) {
    return <div className="p-4 text-center">Loading notifications...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Failed to load notifications.</div>;
  }

  return (
    <Dropdown shouldBlockScroll >
      <DropdownTrigger>
        <Button variant="light">
          Notifikace
          <div className="ml-2 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Notifications menu" variant="faded" className="max-h-[80vh] overflow-y-auto scrollbar-hide"
      >
          {!data || data.length === 0 ? (
            <DropdownItem key="empty">
              No new notifications
            </DropdownItem>
          ) : (
            data.map((notification) => (
              <DropdownSection showDivider key={notification.id}>
              <DropdownItem
                key={notification.id}
                startContent={<NotificationIcon className="text-xl text-default-500 pointer-events-none flex-shrink-0" />}
              >
                <Link href={notification.url || "#"}>
                  <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                    {notification.message}
                  </span>
                  <span className="block text-xs font-medium text-gray-400 dark:text-gray-500">
                    {notification.date_created
                      ? new Date(notification.date_created).toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' })
                      : "Neznámé datum"}
                  </span>
                </Link>
              </DropdownItem>
              </DropdownSection>
            ))
          )}
      </DropdownMenu>
    </Dropdown>
  );
}
