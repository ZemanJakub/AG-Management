"use client";

import Image from "next/image";
import ProfileBg from "@/public/images/profile-bg.jpg";
import { Button, Link } from "@heroui/react";
import PenIcon from "@/components/my-icons/pen-icon";
import { EmployeeToDisplay } from "@/app/lib/models";
import TrashIcon from "@/components/my-icons/trash-icon";

interface PageHeaderProps {
  employeeData: EmployeeToDisplay;
  id: string;
  perrmission: string;
}
interface Colors {
  [key: string]: {
    text: string;
  };
}
interface BorderColors {
  [key: string]: {
    text:
      | "default"
      | "warning"
      | "danger"
      | "success"
      | "primary"
      | "secondary"
      | undefined;
  };
}

const borderColors: BorderColors = {
  default: {
    text: "danger",
  },
  orange: {
    text: "warning",
  },
  green: {
    text: "success",
  },
};

export default function PageHeader({
  employeeData,
  id,
  perrmission,
}: PageHeaderProps) {
  const borderColor ="default";
  return (
    <div
      className={`grow bg-slate-100 dark:bg-slate-900 flex flex-col md:translate-x-0 transition-transform duration-300 ease-in-out translate-x-0
  `}
    >
      {/* Profile background */}
      <div className="relative h-56 bg-slate-200 dark:bg-slate-900">
        <Image
          className="object-cover h-full w-full"
          src={ProfileBg}
          width={979}
          height={220}
          alt="Profile background"
        />
      </div>
      <div className="relative px-4 sm:px-6 pb-2">
        {/* Pre-header */}
        <div className="-mt-16 mb-6 sm:mb-3">
          <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-end">
            {/* Avatar */}
            <div className="inline-flex -ml-1 -mt-1 mb-4 sm:mb-0">
              <Image
                className="rounded-full border-4 border-white dark:border-slate-900 z-10"
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${
                  employeeData.photo || "699729d7-e5fb-48e8-930c-6510fc06eb03"
                }`}
                width={128}
                height={128}
                style={{ width: "128px", height: "128px" }}
                alt="Avatar"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-2 sm:mb-2">
              <Button
                isDisabled={
                  perrmission === "user" || "admin" || "supervizor"
                    ? false
                    : true
                }
                variant="bordered"
                className="border-indigo-500 ml-2"
                href={`/personalistika/zamestnanci/${id}/edit`}
              >
                <Link
                  className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 justify-end"
                  href={`/personalistika/zamestnanci/${id}/edit`}
                >
                  <PenIcon color="indigo-500" />
                  <span className="hidden md:inline ml-2">Editovat</span>
                </Link>
              </Button>
              <Button
                className="border-indigo-500 text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                variant="bordered"
                isDisabled={
                  borderColor === "default" || borderColor === "danger"
                    ? true
                    : false
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>

                <span className="hidden md:inline">K zařazení</span>
              </Button>
              {/* <button className="p-1.5 shrink-0 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm">
                <svg
                  className="w-4 h-1 fill-current text-slate-400"
                  viewBox="0 0 16 4"
                >
                  <circle cx="8" cy="2" r="2" />
                  <circle cx="2" cy="2" r="2" />
                  <circle cx={14} cy="2" r="2" />
                </svg>
              </button>  */}
              <Button
                className="border-indigo-500 ml-2 text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                variant="bordered"
                isDisabled={
                  perrmission === "user" || "admin" || "supervizor"
                    ? false
                    : true
                }
              >
                <TrashIcon color="indigo-500" />
                <span className="hidden md:inline">Odstranit</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="text-center sm:text-left mb-6">
          {/* Name */}
          <div className="inline-flex items-start mb-2">
            <h1 className="text-2xl text-slate-800 dark:text-slate-100 font-bold">{`${employeeData.firstName} ${employeeData.secondName}`}</h1>
            <svg
              className="w-4 h-4 fill-current shrink-0 text-amber-500 ml-2"
              viewBox="0 0 16 16"
            >
              <path d="M13 6a.75.75 0 0 1-.75-.75 1.5 1.5 0 0 0-1.5-1.5.75.75 0 1 1 0-1.5 1.5 1.5 0 0 0 1.5-1.5.75.75 0 1 1 1.5 0 1.5 1.5 0 0 0 1.5 1.5.75.75 0 1 1 0 1.5 1.5 1.5 0 0 0-1.5 1.5A.75.75 0 0 1 13 6ZM6 16a1 1 0 0 1-1-1 4 4 0 0 0-4-4 1 1 0 0 1 0-2 4 4 0 0 0 4-4 1 1 0 1 1 2 0 4 4 0 0 0 4 4 1 1 0 0 1 0 2 4 4 0 0 0-4 4 1 1 0 0 1-1 1Z" />
            </svg>
          </div>
          {/* Meta */}
          <div className="flex flex-wrap justify-center sm:justify-start space-x-4">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 fill-current shrink-0 text-slate-400 dark:text-slate-500"
                viewBox="0 0 16 16"
              >
                <path d="M8 8.992a2 2 0 1 1-.002-3.998A2 2 0 0 1 8 8.992Zm-.7 6.694c-.1-.1-4.2-3.696-4.2-3.796C1.7 10.69 1 8.892 1 6.994 1 3.097 4.1 0 8 0s7 3.097 7 6.994c0 1.898-.7 3.697-2.1 4.996-.1.1-4.1 3.696-4.2 3.796-.4.3-1 .3-1.4-.1Zm-2.7-4.995L8 13.688l3.4-2.997c1-1 1.6-2.198 1.6-3.597 0-2.798-2.2-4.996-5-4.996S3 4.196 3 6.994c0 1.399.6 2.698 1.6 3.697 0-.1 0-.1 0 0Z" />
              </svg>
              <span className="text-sm font-medium whitespace-nowrap text-slate-500 dark:text-slate-400 ml-2">
                {employeeData.adress}
              </span>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}
