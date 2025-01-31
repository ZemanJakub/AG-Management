"use client";

import Image from "next/image";
import Icon02 from "@/public/images/wariorsm.png";
import Icon03 from "@/public/images/telefon.png";
import Icon04 from "@/public/images/kufr.png";
import Icon05 from "@/public/images/cepice.png";
import Icon06 from "@/public/images/hodiny.png";
import Icon07 from "@/public/images/cizinec.png";
import Icon08 from "@/public/images/manager.png";
import Icon09 from "@/public/images/bpobjekt.png";
import Icon10 from "@/public/images/bpevent.png";
import CopyToClipboardButton from "@/components/default-components/copy-to-clipboard-button";
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

interface BasicContentProps {
  employeeData: EmployeeToDisplay;
  id: string;
  perrmission: string;
}
export default function BasicContent({
  id,
  employeeData,
  perrmission,
}: BasicContentProps) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:grid-cols-3  justify-center items-start">
              {/* /* Card start */}
              <Card className="max-w-[400px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <CardHeader className="flex gap-2">
                  <Image
                    alt="nextui logo"
                    height={40}
                    src={Icon02.src}
                    width={40}
                    style={{ width: "auto", height: "auto" }} // Zajištění poměru stran
                  />
                  <div className="flex flex-col">
                    <p className="text-md">Základní údaje</p>

                    {/* <p className="text-small text-default-500">nextui.org</p> */}
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <table className="table-auto w-full">
                    <tbody>
                      <tr>
                        <td className="whitespace-nowrap text-sm w-12">
                          Narozen:
                        </td>
                        <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300 break-words w-full">
                          {employeeData.dateOfBirth !== null
                            ? `${new Date(
                                employeeData.dateOfBirth
                              ).toLocaleDateString()}`
                            : "NaN"}
                        </td>
                        <td className="w-5 text-sm">
                          <CopyToClipboardButton
                            text={
                              employeeData.dateOfBirth !== null
                                ? `${new Date(
                                    employeeData.dateOfBirth
                                  ).toLocaleDateString()}`
                                : "NaN"
                            }
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap text-sm w-12">
                          Rodné číslo:
                        </td>
                        <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300 break-words w-full">
                          {employeeData.pid}
                        </td>
                        <td className="w-5 text-sm">
                          <CopyToClipboardButton
                            text={employeeData.pid ?? ""}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap text-sm w-12">
                          Státní příslušnost:
                        </td>
                        <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300 break-words w-full">
                          {employeeData.state}
                        </td>
                        <td className="w-5 text-sm" />
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap text-sm w-12">
                          Zdravotní pojišťovna:
                        </td>
                        <td className="px-2 font-semibold text-sm text-slate-500 dark:text-slate-300 break-words w-full">
                          {employeeData.insurance}
                        </td>
                        <td className="w-5 text-sm" />
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
                    alt="nextui logo"
                    height={40}
                    src={Icon03.src}
                    width={40}
                    style={{ width: "auto", height: "auto" }} // Zajištění poměru stran
                  />
                  <div className="flex flex-col">
                    <p className="text-md">Kontakt</p>

                    {/* <p className="text-small text-default-500">nextui.org</p> */}
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <table className="table-auto w-full">
                    <tbody>
                      <tr>
                        <td className="whitespace-nowrap text-sm w-12">
                          {/* Bez "w-5", aby se sloupec roztáhl podle obsahu */}
                          Telefon:
                        </td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300 break-words">
                          {employeeData.phone}
                        </td>
                        <td className="w-5 text-sm">
                          <CopyToClipboardButton text={employeeData.phone} />
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap text-sm w-12">
                          Email:
                        </td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300 break-words">
                          {employeeData.email ?? ""}
                        </td>
                        <td className="w-5 text-sm">
                          <CopyToClipboardButton
                            text={employeeData.email ?? ""}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap text-sm w-12">
                          Číslo účtu:
                        </td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300 break-words">
                          {employeeData.acount ?? ""}
                        </td>
                        <td className="w-5 text-sm">
                          <CopyToClipboardButton text={employeeData.acount} />
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap text-sm w-12">
                          Trvale bytem:
                        </td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300 break-words">
                          {employeeData.adress}
                        </td>
                        <td className="w-5 text-sm">
                          <CopyToClipboardButton
                            text={employeeData.adress ?? ""}
                          />
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
                    alt="nextui logo"
                    height={40}
                    src={Icon05.src}
                    width={40}
                    style={{ width: "auto", height: "auto" }} // Zajištění poměru stran
                  />
                  <div className="flex flex-col">
                    <p className="text-md">Kvalifikace</p>

                    {/* <p className="text-small text-default-500">nextui.org</p> */}
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <table className="table-auto">
                    <tbody>
                      <tr>
                        <td className="min-w-max text-sm">Rejstřík trestů:</td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          {employeeData.criminalRecord !== null
                            ? `${new Date(
                                employeeData.criminalRecord
                              ).toLocaleDateString()}`
                            : "NaN"}
                        </td>
                      </tr>
                      <tr>
                        <td className="min-w-max text-sm">
                          Zdravotní prohlídka:
                        </td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          {employeeData.healtCheck !== null
                            ? `${new Date(
                                employeeData.healtCheck
                              ).toLocaleDateString()}`
                            : "NaN"}
                        </td>
                      </tr>
                      <tr>
                        <td className="min-w-max text-sm">Certifikát:</td>
                        <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          {employeeData.certificate}
                        </td>
                      </tr>
                      <tr className="invisible">
                        <td className="min-w-max text-sm ">Certifikát:</td>
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
              {/*Card start */}
              {employeeData.state !== "CZ" && employeeData.state !== "CZ" && (
                <Card className="max-w-[400px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <CardHeader className="flex gap-2">
                    <Image
                      alt="nextui logo"
                      height={40}
                      src={Icon07.src}
                      width={40}
                      style={{ width: "auto", height: "auto" }} // Zajištění poměru stran
                    />
                    <div className="flex flex-col">
                      <p className="text-md">
                        Údaje cizích státních příslušníků
                      </p>

                      {/* <p className="text-small text-default-500">nextui.org</p> */}
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <table className="table-auto w-full">
                      <tbody>
                        <tr>
                          <td className="whitespace-nowrap text-sm">Vízum:</td>
                          <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300 break-words">
                            {employeeData.criminalRecord !== null
                              ? `${new Date(
                                  employeeData.criminalRecord
                                ).toLocaleDateString()}`
                              : "NaN"}
                          </td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap text-sm">
                            Platné do:
                          </td>
                          <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300 break-words">
                            {employeeData.criminalRecord !== null
                              ? `${new Date(
                                  employeeData.criminalRecord
                                ).toLocaleDateString()}`
                              : "NaN"}
                          </td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap text-sm">
                            Doklad totožnosti:
                          </td>
                          <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300 break-words">
                            {employeeData.healtCheck !== null
                              ? `${new Date(
                                  employeeData.healtCheck
                                ).toLocaleDateString()}`
                              : "NaN"}
                          </td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap text-sm">
                            Přístup na pracovní trh:
                          </td>
                          <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300 break-words">
                            {employeeData.certificate}
                          </td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap text-sm">
                            Číslo pojištěnce:
                          </td>
                          <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300 break-words">
                            {employeeData.certificate}
                          </td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap text-sm">
                            Číslo pojištěnce:
                          </td>
                          <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300 break-words">
                            {employeeData.certificate}
                          </td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap text-sm">
                            Splňuje podmínky:
                          </td>
                          <td className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-300 break-words">
                            {employeeData.certificate}
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
              )}

              {/* /* Card end */}

              {/* Card start */}
              <Card className="max-w-[400px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <CardHeader className="flex gap-2">
                  <Image
                    alt="nextui logo"
                    height={40}
                    src={Icon04.src}
                    width={40}
                    style={{ width: "auto", height: "auto" }} // Zajištění poměru stran
                  />
                  <div className="flex flex-col">
                    <p className="text-md">Pracovní zařazení</p>

                    {/* <p className="text-small text-default-500">nextui.org</p> */}
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <table className="table-auto">
                    <tbody>
                      <tr>
                        <td className="min-w-max text-sm">Centrála LKQ</td>
                      </tr>
                      <tr>
                        <td className="min-w-max text-sm">Na Hřebenkách</td>
                      </tr>
                      <tr className="invisible">
                        <td className="min-w-max text-sm ">:</td>
                      </tr>
                      <tr className="invisible">
                        <td className="min-w-max text-sm ">:</td>
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

              {/* Work History */}
              {/* Card start */}
              <Card className="max-w-[400px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <CardHeader className="flex gap-2">
                  <Image
                    alt="nextui logo"
                    height={40}
                    src={Icon06.src}
                    width={40}
                    style={{ width: "auto", height: "auto" }} // Zajištění poměru stran
                  />
                  <div className="flex flex-col">
                    <p className="text-md"> Pracovní Historie</p>

                    {/* <p className="text-small text-default-500">nextui.org</p> */}
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <div className="bg-white dark:bg-slate-800 widt-max">
                    <ul className="space-y-3">
                      {/* Item */}
                      <li className="sm:flex sm:items-center sm:justify-between">
                        <div className="sm:grow flex items-center text-sm">
                          {/* Icon */}
                          <Image
                            className="ml-1 rounded-full my-2 mr-3 border-2 border-orange-400 "
                            src={Icon08}
                            width={40} // Zmenšíme o 4 pixely, aby se vlezlo do rámečku
                            height={40}
                            alt="Icon 03"
                          />
                          {/* Position */}
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-100">
                              Strážný
                            </div>
                            <div className="flex flex-nowrap items-center space-x-2 whitespace-nowrap">
                              <div>Na Hřebenkách</div>
                              <div className="text-slate-400 dark:text-slate-600">
                                
                              </div>
                              <div>Leden, 2020 - Současnost</div>
                            </div>
                          </div>
                        </div>
                      </li>

                      {/* Item */}
                      <li className="sm:flex sm:items-center sm:justify-between">
                        <div className="sm:grow flex items-center text-sm">
                          {/* Icon */}
                          <Image
                            className="ml-1 rounded-full my-2 mr-3 border-2 border-purple-400 "
                            src={Icon09}
                            width={40} // Zmenšíme o 4 pixely, aby se vlezlo do rámečku
                            height={40}
                            alt="Icon 03"
                          />

                          {/* Position */}
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-100">
                              Strážný
                            </div>
                            <div className="flex flex-nowrap items-center space-x-2 whitespace-nowrap">
                              <div>Centrála LKQ</div>
                              <div className="text-slate-400 dark:text-slate-600">
                                ·
                              </div>
                              <div>Duben, 2008 - Leden 2020</div>
                            </div>
                          </div>
                        </div>
                      </li>

                      {/* Item */}
                      <li className="sm:flex sm:items-center sm:justify-between">
                        <div className="sm:grow flex items-center text-sm">
                          {/* Icon */}

                          <Image
                            className="ml-1 rounded-full my-2 mr-3 border-2 border-green-400 "
                            src={Icon10}
                            width={40} // Zmenšíme o 4 pixely, aby se vlezlo do rámečku
                            height={40}
                            alt="Icon 03"
                          />

                          {/* Position */}
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-100">
                              {" "}
                              Strážný
                            </div>
                            <div className="flex flex-nowrap items-center space-x-2 whitespace-nowrap">
                              <div>Abatis</div>
                              <div className="text-slate-400 dark:text-slate-600">
                                ·
                              </div>
                              <div>Leden, 2000 - Duben 2008</div>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </CardBody>
                <Divider />
              </Card>
            </div>
          </div>

          {/* Card end */}
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
