"use client";
import { EmployeeToDisplay } from "@/app/lib/models";
import * as actions from "@/actions";
import Tooltip from "@/components/tooltip";
import Datepicker from "../bdatepicker";
import FormButton from "../common/form-button";
import AddressInput from "../adress-hepler";
import { useActionState } from "react";

interface UpdateBasicEmployeeProps {
  id: string;
  employeeData: EmployeeToDisplay;
}

export default function UpdateBasicDataCard({
  employeeData,
  id,
}: UpdateBasicEmployeeProps) {
  const value = {
    firstName: employeeData.firstName || "",
    secondName: employeeData.secondName || "",
    distinction: employeeData.distinction || "",
    dateOfBirth: employeeData.dateOfBirth || "",
    pid: employeeData.pid || "",
    insurance: employeeData.insurance || "",
    state: employeeData.state || "",
    email: employeeData.email || "",
    phone: employeeData.phone || "",
    acount: employeeData.acount || "",
    adress: employeeData.adress || "",
    criminalRecord: employeeData.criminalRecord || "",
    certificate: employeeData.certificate || "",
    healtCheck: employeeData.healtCheck || "",
  };

  const [state, action, isPending] = useActionState(actions.updateEmployeeData,null);
  
  return (
    <form
      action={action}
      className="bg-white dark:bg-slate-900 h-full "
    >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="uploadError" value="" />
      <div className="flex justify-center md:justify-start">
      <div className="relative">
      <div className="px-4 sm:px-6  py-2 w-full max-w-[96rem] mx-auto">
        <h2 className="text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6">
          Základní údaje
        </h2>
        <div className="grid gap-5 md:grid-cols-3 ">
          {/* firstName Start */}
          <div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="firstName"
              >
                Jméno <span className="text-rose-500">*</span>
              </label>
              <input
                id="firstName"
                className="form-input w-full"
                type="text"
                name="firstName"
                defaultValue={value.firstName}
                required
              />
            </div>
            <div className="text-xs mt-1 text-rose-500">
              {state?.firstName && (
                <span>{state?.firstName}</span>
              )}
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
              <input
                id="secondName"
                className="form-input w-full"
                type="text"
                name="secondName"
                defaultValue={value.secondName}
                required
              />
            </div>
            <div className="text-xs mt-1 text-rose-500">
              {state?.secondName && (
                <span>{state?.secondName}</span>
              )}
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
                <Tooltip className="ml-2" bg="dark" size="md" position="left">
                  <div className="text-sm text-slate-200">
                    V případě shody jmen se použije toto rozlišení.
                  </div>
                </Tooltip>
              </div>
              <input
                id="distinction"
                className="form-input w-full"
                type="text"
                name="distinction"
                defaultValue={value.distinction}
              />
            </div>
            <div className="text-xs mt-1 text-rose-500">
              {state?.distinction && (
                <span>{state?.distinction}</span>
              )}
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
                <Tooltip
                  className="ml-28 pl-1"
                  bg="dark"
                  size="md"
                  position="left"
                >
                  <div className="text-sm text-slate-200">
                    Rok lze přímo editovat.
                  </div>
                </Tooltip>
              </div>
              <Datepicker
                defaultValue={value.dateOfBirth as string}
                bdate
                id="dateOfBirth"
              />
              <div className="text-xs mt-1 text-rose-500">
                {state?.dateOfBirth && (
                  <span>{state?.dateOfBirth as unknown as String}</span>
                )}
              </div>
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
              <input
                id="pid"
                className="form-input w-full"
                type="text"
                name="pid"
                defaultValue={value.pid}
              />
            </div>
            <div className="text-xs mt-1 text-rose-500">
              {state?.pid && <span>{state?.pid}</span>}
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
            <select
              id="state"
              className="form-select w-full bg-white dark:bg-slate-900"
              name="state"
              defaultValue={value.state}
            >
              <option>NaN</option>
              <option>CZ</option>
              <option>SK</option>
              <option>EU</option>
              <option>Mimo EU</option>
              <option>Není vyžadováno</option>
            </select>
            <div className="text-xs mt-1 text-rose-500 w-full">
              {state?.state && <span>{state?.state}</span>}
            </div>
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
            <select
              id="insurance"
              className="form-select w-full bg-white dark:bg-slate-900"
              name="insurance"
              defaultValue={value.insurance}
            >
              <option>NaN</option>
              <option>VZP</option>
              <option>VOZP</option>
              <option>ČPZP</option>
              <option>OZP</option>
              <option>ZPŠ</option>
              <option>ZPMV</option>
              <option>RBP</option>
            </select>
            <div className="text-xs mt-1 text-rose-500 w-full">
              {state?.insurance && (
                <span>{state?.insurance}</span>
              )}
            </div>
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
              <input
                id="phone"
                className="form-input w-full"
                type="text"
                name="phone"
                defaultValue={value.phone}
                required
              />
            </div>
            <div className="text-xs mt-1 text-rose-500">
              {state?.phone && <span>{state?.phone}</span>}
            </div>
          </div>
          {/* phoneEnd */}
          {/* email Start */}
          <div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="form-input w-full"
                type="text"
                name="email"
                defaultValue={value.email}
                required
              />
            </div>
            <div className="text-xs mt-1 text-rose-500">
              {state?.email && <span>{state?.email}</span>}
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
              <input
                id="acount"
                className="form-input w-full"
                type="text"
                name="acount"
                defaultValue={value.acount}
              />
            </div>
            <div className="text-xs mt-1 text-rose-500">
              {state?.acount && (
                <span>{state?.acount}</span>
              )}
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
              <AddressInput id="adress" initAddress={value.adress} />
              <div className="text-xs mt-1 text-rose-500">
                {state?.adress && (
                  <span>{state?.adress}</span>
                )}
              </div>
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
                <Tooltip
                  className="ml-28 pl-1"
                  bg="dark"
                  size="md"
                  position="left"
                >
                  <div className="text-sm text-slate-200">
                    Rok lze přímo editovat.
                  </div>
                </Tooltip>
              </div>
              <Datepicker
                defaultValue={value.criminalRecord as string}
                id="criminalRecord"
              />
              <div className="text-xs mt-1 text-rose-500">
                {state?.criminalRecord && (
                  <span>{state?.criminalRecord?.toString()}</span>
                )}
              </div>
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
                <Tooltip
                  className="ml-28 pl-1"
                  bg="dark"
                  size="md"
                  position="left"
                >
                  <div className="text-sm text-slate-200">
                    Rok lze přímo editovat.
                  </div>
                </Tooltip>
              </div>
              <Datepicker
                defaultValue={value.healtCheck as string}
                id="healtCheck"
              />
              <div className="text-xs mt-1 text-rose-500">
                {state?.healtCheck && (
                  <span>{state?.healtCheck?.toString()}</span>
                )}
              </div>
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
            <select
              id="certificate"
              className="form-select w-full bg-white dark:bg-slate-900"
              name="certificate"
              defaultValue={value.certificate}
            >
              <option>NaN</option>
              <option>Ano</option>
              <option>Ne</option>
              <option>Diplom</option>
              <option>Není vyžadováno</option>
            </select>
            <div className="text-xs mt-1 text-rose-500 w-full">
              {state?.certificate && (
                <span>{state?.certificate}</span>
              )}
            </div>
          </div>
          {/* Certificate Select End */}
        </div>
      </div>
      <div className="flex justify-center items-center p-6 ">
      <FormButton
              color="indigo-500"
              isLoading={isPending}
              disabled={isPending}
            >
              Uložit záznam
            </FormButton>
      </div>
      </div>
      </div>
    </form>
  );
}
