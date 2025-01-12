"use client";
import Image from "next/image";
import { EmployeePersonalInformations } from "@/app/lib/models";
import * as actions from "@/actions";
import { useFormState } from "react-dom";
import Banner from "@/components/banner-nocross";
import FormButton from "../common/form-button";
import Icon02 from "@/public/images/icon-02.svg";
import Datepicker from "../bdatepicker";
import Tooltip from "@/components/tooltip";

interface UpdateBasicEmployeeProps {
  id: string;
  employeeData: EmployeePersonalInformations;
}

export default function UpdateQualificationCard({
  employeeData,
  id,
}: UpdateBasicEmployeeProps) {
  const value = {
    criminalRecord: employeeData.criminalRecord || "",
    certificate: employeeData.certificate || "",
    healtCheck: employeeData.healtCheck || "",
  };

  const [formState, action] = useFormState(
    actions.updateEmployeeQualification.bind(null, id),
    {
      errors: {},
    }
  );

  return (
    <div className="bg-white dark:bg-slate-800 p-4  rounded-sm shadow-sm">
      <div className="grow flex items-center truncate">
        <Image
          className="ml-1"
          src={Icon02}
          width={24}
          height={24}
          alt="Icon 02"
        />

        <div className="truncate">
          <div className="text-base text-slate-800 dark:text-slate-100 font-semibold mb-2 mt-2 ml-3">
            Kvalifikace
          </div>
        </div>
      </div>
      <form action={action}>
        <div className="bg-white dark:bg-slate-800 pt-4 ">
          {formState.errors.uploadError && (
            <Banner type="error" className="mb-4 fixed top-30 z-50 mx-auto">
              {formState.errors.uploadError ? (
                <span>{formState.errors.uploadError}</span>
              ) : null}
            </Banner>
          )}
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
                {formState.errors.criminalRecord && (
                  <span>{formState.errors.criminalRecord}</span>
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
                {formState.errors.healtCheck && (
                  <span>{formState.errors.healtCheck}</span>
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
              className="form-select w-full"
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
              {formState.errors.certificate && (
                <span>{formState.errors.certificate}</span>
              )}
            </div>
          </div>
          {/* Certificate Select End */}
          <div className="flex justify-end items-end p-2 bg-slate-50 dark:bg-slate-800 ">
            <FormButton>Uložit záznam</FormButton>
          </div>
        </div>
      </form>
    </div>
  );
}
