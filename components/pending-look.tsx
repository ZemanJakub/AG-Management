"use client";

import { Spinner } from "@heroui/react";
import { useFormStatus } from "react-dom";

interface FormButtonProps {
  children: React.ReactNode;
  className?: string;
  isMyPending?: boolean;
}

export default function PendingLook({ children, className,isMyPending }: FormButtonProps) {
  const { pending } = useFormStatus();
  return (
    <>
      {(pending||isMyPending) && (
        <div className={className}>
          <Spinner label="Načítám..." color="default" />
        </div>
      )}

      {(!pending&&!isMyPending) && children}
    </>
  );
}
