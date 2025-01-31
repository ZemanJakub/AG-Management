"use client";

import Image from "next/image";
import Icon01 from "@/public/images/zdravotni.png";
import Icon02 from "@/public/images/preference.png";
import Icon03 from "@/public/images/exekuce.png";
import Icon04 from "@/public/images/poznamka.png";
// predelat na tuto fetch fetchPersonalEmployeeData
import TiptapView from "@/components/tiptap-view";
import { EmployeeToDisplay } from "@/app/lib/models";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image as UIImage,
} from "@heroui/react";
import PenIcon from "@/components/my-icons/pen-icon";
import CopyToClipboardButton from "@/components/default-components/copy-to-clipboard-button";
interface BasicContentProps {
  employeeData: EmployeeToDisplay;
  id: string;
  perrmission: string;
}

export default function PersonalContent({
  id,
  employeeData,
  perrmission,
}: BasicContentProps) {
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
                        width={40}
                        height={40}
                        alt="Icon 02"
                        style={{ width: "auto", height: "auto" }}
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
                        href={`/personalistika/zamestnanci/${id}/edit`}
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
          {/* Departments */}
          <div>
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:grid-cols-3  justify-center items-start">
              {/* /* Card start */}
              <Card className="max-w-[400px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <CardHeader className="flex gap-2">
                  <div className="grow flex items-center truncate mb-2">
                   
                      <Image
                        src={Icon01.src}
                        width={40}
                        height={40}
                        alt="Icon 01"
                        style={{ width: "auto", height: "auto" }}
                      />
                  
                    <div className="truncate">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        Zdravotní údaje, inzerce, praxe
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <table className="table-auto">
                    <tbody>
                      <tr>
                        <td className="min-w-max text-sm">Zdravotní stav:</td>
                        <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300">
                          {employeeData.healthStatus
                            ? employeeData.healthStatus
                            : "NaN"}
                        </td>
                      </tr>
                      <tr>
                        <td className="min-w-max text-sm">Kuřák:</td>
                        <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300">
                          {employeeData.smoker ? employeeData.smoker : "NaN"}
                        </td>
                      </tr>
                      <tr>
                        <td className="min-w-max text-sm">Inzerce:</td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          {employeeData.recruitment
                            ? employeeData.recruitment
                            : "NaN"}
                        </td>
                      </tr>
                      <tr>
                        <td className="min-w-max text-sm">Praxe:</td>
                        <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300">
                          {employeeData.practice
                            ? employeeData.practice
                            : "NaN"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardBody>
                <Divider />
                <CardFooter>
                  <Link
                    isDisabled={
                      perrmission === "user" || "admin" || "supervizor"
                        ? false
                        : true
                    }
                    className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 justify-end"
                    href={`/personalistika/zamestnanci/${id}/edit`}
                  >
                    <PenIcon color="indigo-500" />
                    <span className="md:inline ml-2">Editovat</span>
                  </Link>
                </CardFooter>
              </Card>

              {/* /* Card end */}
              {/* /* Card start */}
              <Card className="max-w-[400px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <CardHeader className="flex gap-2">
                  <Image
                               src={Icon02.src}
                    width={40}
                    height={40}
                    alt="Icon 03"
                    style={{ width: "auto", height: "auto" }}
                  />
                  <div className="flex flex-col">
                    <p className="text-md">Preference</p>

                    {/* <p className="text-small text-default-500">nextui.org</p> */}
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <table className="table-auto">
                    <tbody>
                      <tr>
                        <td className="min-w-max text-sm">Termín nástupu:</td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          {employeeData.dateOfEmployment !== null
                            ? `${new Date(
                                employeeData.dateOfEmployment
                              ).toLocaleDateString()}`
                            : "NaN"}
                        </td>
                      </tr>
                      <tr>
                        <td className="min-w-max text-sm">
                          Preferované směny:
                        </td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          {employeeData.shifts ? employeeData.shifts : ""}
                        </td>
                      </tr>
                      <tr>
                        <td className="min-w-max text-sm">Počet směn:</td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          {employeeData.shiftsValue
                            ? employeeData.shiftsValue
                            : ""}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardBody>
                <Divider />
                <CardFooter>
                  <Link
                    isDisabled={
                      perrmission === "user" || "admin" || "supervizor"
                        ? false
                        : true
                    }
                    className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 justify-end"
                    href={`/personalistika/zamestnanci/${id}/edit`}
                  >
                    <PenIcon color="indigo-500" />
                    <span className="md:inline ml-2">Editovat</span>
                  </Link>
                </CardFooter>
              </Card>

              {/* /* Card end */}

              {/* /* Card start */}
              <Card className="max-w-[400px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <CardHeader className="flex gap-2">
                  <Image
             
                    src={Icon03.src}
                    width={40}
                    height={40}
                    alt="Icon 03"
                    style={{ width: "auto", height: "auto" }}
                  />

                  <div className="flex flex-col">
                    <p className="text-md">Exekuce a jiné DPP</p>

                    {/* <p className="text-small text-default-500">nextui.org</p> */}
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <table className="table-auto">
                    <tbody>
                      <tr>
                        <td className="min-w-max text-sm">Jiné DPP:</td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          {employeeData.otherDPP
                            ? employeeData.otherDPP
                            : "NaN"}
                        </td>
                      </tr>
                      <tr>
                        <td className="min-w-max text-sm">
                          Výdělek u jiných DPP:
                        </td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          {employeeData.otherDPPValue
                            ? employeeData.otherDPPValue
                            : "NaN"}
                        </td>
                      </tr>
                      <tr>
                        <td className="min-w-max text-sm">Exekuce:</td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          {employeeData.execution
                            ? employeeData.execution
                            : "NaN"}
                        </td>
                      </tr>
                      <tr>
                        <td className="min-w-max text-sm">Částka exekuce:</td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          {employeeData.valueOfExecution
                            ? employeeData.valueOfExecution
                            : "NaN"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardBody>
                <Divider />
                <CardFooter>
                  <Link
                    isDisabled={
                      perrmission === "user" || "admin" || "supervizor"
                        ? false
                        : true
                    }
                    className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 justify-end"
                    href={`/personalistika/zamestnanci/${id}/edit`}
                  >
                    <PenIcon color="indigo-500" />
                    <span className="md:inline ml-2">Editovat</span>
                  </Link>
                </CardFooter>
              </Card>

              {/* Card end */}
            </div>
          </div>
          {/* /* Card start */}
          <Card className="max-w-[400px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex gap-2">
              <Image
         
                src={Icon04.src}
                width={40}
                height={40}
                alt="Icon 04"
                style={{ width: "auto", height: "auto" }}
              />

              <div className="flex flex-col">
                <p className="text-md">Poznámka</p>

                {/* <p className="text-small text-default-500">nextui.org</p> */}
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <TiptapView
                defaultValue={employeeData.comment ? employeeData.comment : ""}
              />
            </CardBody>
            <Divider />
            <CardFooter>
              <Link
                isDisabled={
                  perrmission === "user" || "admin" || "supervizor"
                    ? false
                    : true
                }
                className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 justify-end"
                href={`/personalistika/zamestnanci/${id}/edit`}
              >
                <PenIcon color="indigo-500" />
                <span className="md:inline ml-2">Editovat</span>
              </Link>
            </CardFooter>
          </Card>
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
            <a
              className="hover:cursor-pointer"
              href={`mailto:${employeeData.email}`}
            >
              {employeeData.email}
            </a>
          </div>
          <div className="text-sm">
            <h3 className="font-medium text-slate-800 dark:text-slate-100">
              Tel
            </h3>
            <a
              className="hover:cursor-pointer"
              href={`tel:${employeeData.phone}`}
            >
              {employeeData.phone}
            </a>
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
