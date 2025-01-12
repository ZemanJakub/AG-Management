"use client";

import { useState } from "react";
import CopySvg from "@/public/images/copy-to-clipborad.svg";
import Image from "next/image";
import { Tooltip } from "@nextui-org/react";

export default function 


CopyToClipboardButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000); // Reset copied state after 2 seconds
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
      <Tooltip
        content={copied ? "Copied!" : "Copy to clipboard"}
        placement="right"
        className="bg-slate-900 dark:bg-slate-600 text-white dark:text-slate-200"
      >
      <Image
        src={CopySvg}
        width={20}
        height={20}
        alt="Icon 02"
        onClick={copyToClipboard}
      />
      </Tooltip>
    </div>
  );
}
