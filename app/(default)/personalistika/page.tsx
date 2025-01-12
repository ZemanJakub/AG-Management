export const metadata = {
  title: "Přijímací proces",
  description: "Přijímací proces",
};

import FilterButton from "@/components/default-components/dropdown-filter";
import EmployesTable from "../../../components/employees/my-employes-table";
import PaginationClassic from "@/components/default-components/pagination-classic";
import SearchForm from "@/components/default-components/search-form";

import { directus } from "@/app/lib/directus";
import { readItems } from "@directus/sdk";
import { EmployeeToDisplay } from "@/app/lib/models";
import Link from "next/link";

export default async function Customers() {
  // fetch newemployee data start
  const result = await directus.request(
    readItems("employees")
  );
  console.log("fetch items zamestnanci", result.length)
  // fetch newemployee data end

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-32 py-8 w-full max-w-[-10rem] mx-auto">
      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold">
            Přijímací proces ✨
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          {/* Delete button */}
          {/* <DeleteButton /> */}

          {/* Dropdown */}
          {/* <DateSelect /> */}

          {/* Search form */}
          <SearchForm placeholder="Hledej …" />

          {/* Filter button */}
          <FilterButton align="right" />

          {/* Add employee button start*/}

          <Link
            className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
            type="submit"
            href="/personalistika/zamestnanci/novy-zamestnanec"
          >
            <svg
              className="w-4 h-4 fill-current opacity-50 shrink-0"
              viewBox="0 0 16 16"
            >
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="hidden xs:block ml-2">Nový zaměstnanec</span>
          </Link>

          {/* Add employee button end*/}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <ul className="flex flex-wrap -m-1">
          <li className="m-1">
            <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-transparent shadow-sm bg-indigo-500 text-white duration-150 ease-in-out">
              Aktivní
            </button>
          </li>
          <li className="m-1">
            <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 duration-150 ease-in-out">
              Neaktivní
            </button>
          </li>
          <li className="m-1">
            <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 duration-150 ease-in-out">
              V procesu
            </button>
          </li>
          <li className="m-1">
            <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 duration-150 ease-in-out">
              Vše
            </button>
          </li>
        </ul>
      </div>

      {/* Table */}
      <EmployesTable employees={result as EmployeeToDisplay[]} />

      {/* Pagination */}
      <div className="mt-8">
        <PaginationClassic />
      </div>
    </div>
  );
}
