import Image from "next/image";
import Icon02 from "@/public/images/icon-02.svg";
import Link from "next/link";
import {
  fetchHolderData,
  fetchBasicEmployeeData,
} from "@/db/queries/employees";
// predelat na tuto fetch fetchPersonalEmployeeData
interface BasicContentProps {
  id: string;
}

export default async function ContractContent({ id }: BasicContentProps) {
  const employeeData = await fetchBasicEmployeeData(id);
  const holderData = await fetchHolderData(id);
  if (!employeeData || !holderData) {
    return (
      <div className="relative px-4 sm:px-6 pb-8">
        <div className="flex flex-col xl:flex-row xl:space-x-16">
          {/* Main content */}
          <div className="flex-1 space-y-5 mb-8 xl:mb-0">
            {/* Departments */}
            <div>
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
                        Údaje se nepodařilo najít
                      </span>
                    </div>
                  </div>
                  {/* Card footer */}
                  <div className="flex justify-end items-end">
                    {/* Link */}
                    <div>
                      <Link
                        className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 justify-end"
                        href={{
                          pathname: `/personalistika/zamestnanci/${id}/edit`,
                          query: { name: "Výstroj" },
                        }}
                      >
                        Upravit -&gt;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative px-4 sm:px-6 pb-8">
      <div className="flex flex-col xl:flex-row xl:space-x-16">
        {/* Main content */}
        <div className="flex-1 space-y-5 mb-8 xl:mb-0">
          {/* /* Card start */}
          <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-sm shadow-sm ">
            {/* Card header */}
            <div className="text-center mb-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Velikosti
              </h2>
            </div>

            {/* Card content */}
            <div className="flex flex-col mt-2 items-center justify-items-center ">
              <table className="table-auto">
                <tbody>
                  <tr className="grid grid-cols-4 gap-4 md:block">
                    <td className="min-w-max text-sm">Zimní bunda:</td>
                    <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300">
                      {holderData.zimnibunda ? holderData.zimnibunda : "NaN"}
                    </td>
                    <td className="min-w-max text-sm">Softschell:</td>
                    <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300">
                      {holderData.softschell ? holderData.softschell : "NaN"}
                    </td>
                    <td className="min-w-max text-sm">Mikina:</td>
                    <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                      {holderData.mikina ? holderData.mikina : "NaN"}
                    </td>
                    <td className="min-w-max text-sm">Triko:</td>
                    <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                      {holderData.triko ? holderData.triko : "NaN"}
                    </td>
                    <td className="min-w-max text-sm">Kalhoty:</td>
                    <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300">
                      {holderData.kalhoty ? holderData.kalhoty : "NaN"}
                    </td>
                    <td className="min-w-max text-sm">Boty:</td>
                    <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300">
                      {holderData.boty ? holderData.boty : "NaN"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card end */}

          {/* Card footer */}
          {/* <div className="flex justify-end items-end">
              
              <div>
                <Link
                  className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 justify-end"
                  href={{
                    pathname: `/personalistika/zamestnanci/${id}/edit`,
                    query: { name: "Personalistika" },
                  }}
                >
                  Upravit -&gt;
                </Link>
              </div>
            </div> */}

          {/* Departments */}
          <div>
            {/* Cards */}
            <div className="grid xl:grid-cols-2 gap-4"></div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="xl:min-w-[14rem] xl:w-[14rem] space-y-3">
          <div className="text-sm">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Pozice
            </h3>
            <div>Strážný</div>
          </div>
          <div className="text-sm">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Email
            </h3>
            <a className="hover:cursor-pointer" href={`mailto:${employeeData.email}`}>{employeeData.email}</a>
          </div>
          <div className="text-sm">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Tel
            </h3>
            <a className="hover:cursor-pointer" href={`tel:${employeeData.phone}`}>{employeeData.phone}</a>
          </div>
          <div className="text-sm">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Narozen
            </h3>
            <div>
              {employeeData.dateOfBirth
                ? new Date(employeeData.dateOfBirth).toLocaleDateString()
                : "NaN"}
            </div>
          </div>
          <div className="text-sm">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Zaměstnán od
            </h3>
            <div>
              {employeeData.dateOfEmployment
                ? new Date(employeeData.dateOfEmployment).toLocaleDateString()
                : "NaN"}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
