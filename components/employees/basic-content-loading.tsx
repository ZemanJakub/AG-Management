"use client"

import Image from "next/image";
import Icon02 from "@/public/images/icon-02.svg";
import UserImage01 from "@/public/images/avatar-01.jpg";
import UserImage03 from "@/public/images/avatar-03.jpg";
import { Skeleton } from "@heroui/react";



export default function BasicContentLoading() {
  return (
    <div className="relative px-4 sm:px-6 pb-8">
      <div className="flex flex-col xl:flex-row xl:space-x-16">
        {/* Main content */}
        <div className="flex-1 space-y-5 mb-8 xl:mb-0">
          {/* Departments */}
          <div>
            <h2 className="text-slate-800 dark:text-slate-100 font-semibold mb-2">
              Osobní údaje
            </h2>
            {/* Cards */}
            <div className="grid xl:grid-cols-2 gap-4">
              {/* /* Card start */}
              <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-sm shadow-sm">
                {/* Card header */}
                <div className="grow flex items-center truncate mb-2">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-slate-700 rounded-full mr-2">
                    <Image
                      className="ml-1"
                      src={Icon02}
                      width={14}
                      height={14}
                      alt="Icon 03"
                    />
                  </div>
                  <div className="truncate">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      Základní údaje
                    </span>
                  </div>
                </div>
                {/* Card content */}
                <table className="table-auto">
                  <tbody>
                    <tr>
                      <td className="min-w-max text-sm">Narozen:</td>
                      <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300">
                      <Skeleton className="w-32 h-5"/>
                      </td>
                    </tr>
                    <tr>
                      <td className="min-w-max text-sm">Rodné číslo:</td>
                      <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300">
                      <Skeleton className="w-32 h-5"/>
                      </td>
                    </tr>
                    <tr>
                      <td className="min-w-max text-sm">
                        Zdravotní pojišťovna:
                      </td>
                      <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300">
                      <Skeleton className="w-32 h-5"/>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-end items-end">
                  <Skeleton className="w-32 h-5"/>
                  </div>
              </div>
              {/* /* Card end */}
              {/* Card start */}
              <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-sm shadow-sm">
                <div className="grow flex items-center truncate mb-2">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-slate-700 rounded-full mr-2">
                    <Image
                      className="ml-1"
                      src={Icon02}
                      width={14}
                      height={14}
                      alt="Icon 03"
                    />
                  </div>

                  <div className="truncate">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      Kontakt
                    </span>
                  </div>
                </div>
                {/* Card content */}
                <table className="table-auto">
                  <tbody>
                    <tr>
                      <td className="min-w-max text-sm">Telefon:</td>
                      <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                      <Skeleton className="w-32 h-5"/>
                      </td>
                    </tr>
                    <tr>
                      <td className="min-w-max text-sm">Email:</td>
                      <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                      <Skeleton className="w-32 h-5"/>
                      </td>
                    </tr>
                    <tr>
                      <td className="min-w-max text-sm">Číso účtu:</td>
                      <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                      <Skeleton className="w-32 h-5"/>
                      </td>
                    </tr>
                    <tr>
                      <td className="min-w-max text-sm">Trvale bytem:</td>
                      <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                      <Skeleton className="w-32 h-5"/>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-end items-end">
                  <Skeleton className="w-32 h-5"/>
                  </div>
              </div>
              {/* Card end */}
            

              {/* Card start */}
              <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-sm shadow-sm">
                <div className="grow flex items-center truncate mb-2">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-slate-700 rounded-full mr-2">
                    <Image
                      className="ml-1"
                      src={Icon02}
                      width={14}
                      height={14}
                      alt="Icon 03"
                    />
                  </div>

                  <div className="truncate">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      Kvalifikace
                    </span>
                  </div>
                </div>
                {/* Card content */}
                <table className="table-auto">
                  <tbody>
                    <tr>
                      <td className="min-w-max text-sm">Rejstřík trestů:</td>
                      <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                      <Skeleton className="w-32 h-5"/>
                      </td>
                    </tr>
                    <tr>
                      <td className="min-w-max text-sm">
                        Zdravotní prohlídka:
                      </td>
                      <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                      <Skeleton className="w-32 h-5"/>
                      </td>
                    </tr>
                    <tr>
                      <td className="min-w-max text-sm">Certifikát:</td>
                      <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                      <Skeleton className="w-32 h-5"/>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-end items-end">
                  <Skeleton className="w-32 h-5"/>
                  </div>
              </div>
              {/* Card end */}
              {/* Card start */}
              <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-sm shadow-sm">
                <div className="grow flex items-center truncate mb-2">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-slate-700 rounded-full mr-2">
                    <Image
                      className="ml-1"
                      src={Icon02}
                      width={14}
                      height={14}
                      alt="Icon 03"
                    />
                  </div>

                  <div className="truncate">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      Pracovní zařazení
                    </span>
                  </div>
                </div>
                {/* Card content */}
                <table className="table-auto">
                  <tbody>
                    <tr>
                      <td className="min-w-max text-sm">Centrála LKQ</td>
                    </tr>
                    <tr>
                      <td className="min-w-max text-sm">Na Hřebenkách</td>
                    </tr>
                  </tbody>
                </table>
                {/* Card footer */}
                <div className="flex justify-between items-center mt-2">
                  {/* Avatars group */}
                  <div className="flex -space-x-3 -ml-0.5">
                    <Image
                      className="rounded-full border-2 border-white dark:border-slate-800 box-content"
                      src={UserImage03}
                      width={24}
                      height={24}
                      alt="Avatar"
                    />
                    <Image
                      className="rounded-full border-2 border-white dark:border-slate-800 box-content"
                      src={UserImage01}
                      width={24}
                      height={24}
                      alt="Avatar"
                    />
                  </div>
                  {/* Link */}
                  <div >
                  <Skeleton className="w-32 h-5"/>
                  </div>
                </div>
                
              </div>
              {/* Card end */}
            </div>
          </div>

          {/* Work History */}
          <div>
            <h2 className="text-slate-800 dark:text-slate-100 font-semibold mb-2">
              Pracovní Historie
            </h2>
            <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-sm shadow-sm">
              <ul className="space-y-3">
                {/* Item */}
                <li className="sm:flex sm:items-center sm:justify-between">
                  <div className="sm:grow flex items-center text-sm">
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-full shrink-0 bg-amber-500 my-2 mr-3">
                      <svg
                        className="w-8 h-8 fill-current text-amber-50"
                        viewBox="0 0 32 32"
                      >
                        <path d="M21 14a.75.75 0 0 1-.75-.75 1.5 1.5 0 0 0-1.5-1.5.75.75 0 1 1 0-1.5 1.5 1.5 0 0 0 1.5-1.5.75.75 0 1 1 1.5 0 1.5 1.5 0 0 0 1.5 1.5.75.75 0 1 1 0 1.5 1.5 1.5 0 0 0-1.5 1.5.75.75 0 0 1-.75.75Zm-7 10a1 1 0 0 1-1-1 4 4 0 0 0-4-4 1 1 0 0 1 0-2 4 4 0 0 0 4-4 1 1 0 0 1 2 0 4 4 0 0 0 4 4 1 1 0 0 1 0 2 4 4 0 0 0-4 4 1 1 0 0 1-1 1Z" />
                      </svg>
                    </div>
                    {/* Position */}
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                      <Skeleton className="w-32 h-5"/>
                      </div>
                      <div className="flex flex-nowrap items-center space-x-2 whitespace-nowrap">
                        <div><Skeleton className="w-32 h-5"/></div>
                        <div className="text-slate-400 dark:text-slate-600">
                          ·
                        </div>
                        <div><Skeleton className="w-32 h-5"/></div>
                      </div>
                    </div>
                  </div>
                </li>

                {/* Item */}
                <li className="sm:flex sm:items-center sm:justify-between">
                  <div className="sm:grow flex items-center text-sm">
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-full shrink-0 bg-indigo-500 my-2 mr-3">
                      <svg
                        className="w-8 h-8 fill-current text-indigo-50"
                        viewBox="0 0 32 32"
                      >
                        <path d="M8.994 20.006a1 1 0 0 1-.707-1.707l4.5-4.5a1 1 0 0 1 1.414 0l3.293 3.293 4.793-4.793a1 1 0 1 1 1.414 1.414l-5.5 5.5a1 1 0 0 1-1.414 0l-3.293-3.293L9.7 19.713a1 1 0 0 1-.707.293Z" />
                      </svg>
                    </div>
                    {/* Position */}
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                      <Skeleton className="w-32 h-5"/>
                      </div>
                      <div className="flex flex-nowrap items-center space-x-2 whitespace-nowrap">
                        <div><Skeleton className="w-32 h-5"/></div>
                        <div className="text-slate-400 dark:text-slate-600">
                          ·
                        </div>
                        <div><Skeleton className="w-32 h-5"/></div>
                      </div>
                    </div>
                  </div>
                </li>

                {/* Item */}
                <li className="sm:flex sm:items-center sm:justify-between">
                  <div className="sm:grow flex items-center text-sm">
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-full shrink-0 bg-indigo-500 my-2 mr-3">
                      <svg
                        className="w-8 h-8 fill-current text-indigo-50"
                        viewBox="0 0 32 32"
                      >
                        <path d="M8.994 20.006a1 1 0 0 1-.707-1.707l4.5-4.5a1 1 0 0 1 1.414 0l3.293 3.293 4.793-4.793a1 1 0 1 1 1.414 1.414l-5.5 5.5a1 1 0 0 1-1.414 0l-3.293-3.293L9.7 19.713a1 1 0 0 1-.707.293Z" />
                      </svg>
                    </div>
                    {/* Position */}
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                      <Skeleton className="w-32 h-5"/>
                      </div>
                      <div className="flex flex-nowrap items-center space-x-2 whitespace-nowrap">
                        <div><Skeleton className="w-32 h-5"/></div>
                        <div className="text-slate-400 dark:text-slate-600">
                          ·
                        </div>
                        <div><Skeleton className="w-32 h-5"/></div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="xl:min-w-[14rem] xl:w-[14rem] space-y-3">
          <div className="text-sm">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Pozice
            </h3>
            <div><Skeleton className="w-32 h-5"/></div>
          </div>
          <div className="text-sm">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Email
            </h3>
            <div> <Skeleton className="w-32 h-5"/></div>
          </div>
          <div className="text-sm">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Tel
            </h3>
            <div> <Skeleton className="w-32 h-5"/></div>
          </div>
          <div className="text-sm">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Narozen
            </h3>
            <div>
            <Skeleton className="w-32 h-5"/>
            </div>
          </div>
          <div className="text-sm">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Zaměstnán od
            </h3>
            <div>
            <Skeleton className="w-32 h-5"/>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
