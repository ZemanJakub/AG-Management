"use client";

import Image from "next/image";
import ProfileBg from "@/public/images/profile-bg.jpg";
import { Skeleton } from "@heroui/react";


export default function PageHeaderLoading() {

  return (
    <div
    className={`grow bg-white dark:bg-slate-900 flex flex-col md:translate-x-0 transition-transform duration-300 ease-in-out translate-x-0
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
            <Skeleton
              className="rounded-full border-4  border-white dark:border-slate-900 z-10"
              style={{ width: "128px", height: "128px" }}/>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="text-center sm:text-left mb-6">
        {/* Name */}
        <div className="inline-flex items-start mb-2">
          <Skeleton className="w-48 h-7"/>
        </div>
        {/* Meta */}
        <div className="flex flex-wrap justify-center sm:justify-start space-x-4">
          <div className="flex items-center">
            <Skeleton className="w-64 h-6">
            </Skeleton>
          </div>
        </div>
      </header>
      </div>
      </div>
  );
}
