import Image from "next/image";
import Link from "next/link";
import Icon02 from "@/public/images/icon-02.svg";
import {
  fetchBasicEmployeeData,
  fetchDocumentData,
} from "@/db/queries/employees";
import DocumentHandler from "./document-handler";

interface BasicContentProps {
  id: string;
  isEditable: boolean;
}

export default async function DocumentContent({
  id,
  isEditable,
}: BasicContentProps) {
  const employeeData = await fetchBasicEmployeeData(id);
  const documentData = await fetchDocumentData(employeeData?.folderId?? "");
  if (!employeeData) {
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
                          query: { name: "Dokumenty" },
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
      <div className="w-full flex flex-col xl:flex-row">      
        <DocumentHandler
          id={id}
          isEditable={isEditable}
          employeeData={employeeData as any}
          documentData={documentData}
        />
        {/* Sidebar */}
        <aside className="w-full xl:w-56 flex flex-col justify-center md:justify-start border-t pt-4 xl:border-none">
          <div className="w-56 ml-6 md:ml-0">
            <div className="text-sm">
              <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                Pozice
              </h3>
              <div className="mb-2">Strážný</div>
            </div>
            <div className="text-sm mb-2">
              <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                Email
              </h3>
              <a
                className="hover:cursor-pointer "
                href={`mailto:${employeeData.email}`}
              >
                {employeeData.email}
              </a>
            </div>
            <div className="text-sm mb-2">
              <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                Tel
              </h3>
              <a
                className="hover:cursor-pointer mb-2"
                href={`tel:${employeeData.phone}`}
              >
                {employeeData.phone}
              </a>
            </div>
            <div className="text-sm">
              <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                Narozen
              </h3>
              <div className="mb-2">
                {employeeData.dateOfBirth
                  ? new Date(employeeData.dateOfBirth).toLocaleDateString()
                  : "NaN"}
              </div>
            </div>
            <div className="text-sm">
              <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                Zaměstnán od
              </h3>
              <div className="mb-2">
                {employeeData.dateOfEmployment
                  ? new Date(employeeData.dateOfEmployment).toLocaleDateString()
                  : "NaN"}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
