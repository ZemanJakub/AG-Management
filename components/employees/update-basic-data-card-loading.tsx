"use client";

import { Skeleton } from "@heroui/react";

export default function UpdateBasicDataCardLoading() {
  return (
    <form className="relative bg-white dark:bg-slate-900 h-full">
      <div className="px-4 sm:px-6  py-2 w-full max-w-[96rem] mx-auto">
        <h2 className="text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6">
          Základní údaje
        </h2>
        <div className="grid gap-5  md:grid-cols-3">
          {/* firstName Start */}
          <div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="firstName"
              >
                Jméno <span className="text-rose-500">*</span>
              </label>
              <Skeleton className="w-32 h-5" />
            </div>
          </div>
          {/* firstNameEnd */}
          {/* secondName Start */}
          <div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="secondName"
              >
                Příjmení <span className="text-rose-500">*</span>
              </label>
              <Skeleton className="w-32 h-5" />
            </div>
          </div>
          {/* secondName End */}
          {/* distinction Start */}
          <div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="distinction"
                >
                  Druhé jméno / rozlišení
                </label>
              </div>
              <Skeleton className="w-32 h-5" />
            </div>
          </div>
          {/* distinction End */}
          {/* dateOfBirth Start */}
          <div>
            <div>
              <div className="flex items-center justify-between ">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="dateOfBirth"
                >
                  Datum narození<span className="text-rose-500">*</span>
                </label>
              </div>
              <Skeleton className="w-32 h-5" />
            </div>
          </div>
          {/* dateOfBirth End */}
          {/* pid Start */}
          <div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium mb-1" htmlFor="pid">
                  Rodné číslo
                </label>
              </div>
              <Skeleton className="w-32 h-5" />
            </div>
          </div>
          {/* pid End */}
          {/* Select state start*/}
          <div className="w-full">
            <label
              className="block text-sm font-medium mb-1 w-full"
              htmlFor="state"
            >
              Státní příslušnost
            </label>
            <Skeleton className="w-32 h-5" />
          </div>
          {/* Select state end*/}
          {/* Select */}
          <div className="w-full">
            <label
              className="block text-sm font-medium mb-1 w-full"
              htmlFor="insurance"
            >
              Zdravotní pojišťovna
            </label>
            <Skeleton className="w-32 h-5" />
          </div>
        </div>
        {/* Basic end */}
        {/* Contact start */}
        <h2 className="border-t  border-slate-600 text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6 pt-4 mt-6">
          Kontaktní údaje
        </h2>
        <div className="grid gap-5  md:grid-cols-3">
          {/* phone Start */}
          <div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="firstName"
              >
                Telefon <span className="text-rose-500">*</span>
              </label>
              <Skeleton className="w-32 h-5" />
            </div>
          </div>
          {/* phoneEnd */}
          {/* email Start */}
          <div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <Skeleton className="w-32 h-5" />
            </div>
          </div>
          {/* email End */}
          {/* acount Start */}
          <div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="distinction"
                >
                  Číso účtu
                </label>
              </div>
              <Skeleton className="w-32 h-5" />
            </div>
          </div>
          {/* acount End */}
          {/* adresa Start */}
          {/* start adresa*/}
          <div>
            <div>
              <label
                className="block text-sm font-medium mb-1 "
                htmlFor="adress"
              >
                Adresa
              </label>
              <Skeleton className="w-32 h-5" />
            </div>
          </div>
          {/* end adresa*/}
        </div>
        {/* Contact start */}
        <h2 className="border-t  border-slate-600 text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6 pt-4 mt-6">
          Kvalifikace
        </h2>
        <div className="grid gap-5  md:grid-cols-3">
          {/* criminalRecord Start */}
          <div>
            <div>
              <div className="flex items-center justify-between ">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="criminalRecord"
                >
                  Výpis RT
                </label>
              </div>
              <Skeleton className="w-32 h-5" />
            </div>
          </div>
          {/* criminalRecord End */}
          {/* healtCheck Start */}
          <div>
            <div>
              <div className="flex items-center justify-between ">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="healtCheck"
                >
                  Zdravotní prohlídka
                </label>
              </div>
              <Skeleton className="w-32 h-5" />
            </div>
          </div>
          {/* healtCheck End */}
          {/* Certificate Select Start */}
          <div className="w-full">
            <label
              className="block text-sm font-medium mb-1 w-full"
              htmlFor="certificate"
            >
              Certifikát
            </label>
            <Skeleton className="w-32 h-5" />
          </div>
          {/* Certificate Select End */}
        </div>
      </div>
    </form>
  );
}
