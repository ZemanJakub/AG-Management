"use client";
import Image from "next/image";
import { EmployeePersonalInformations } from "@/app/lib/models";
import * as actions from "@/actions";
import { useActionState } from "react";
import Banner from "@/components/banner-nocross";
import FormButton from "../common/form-button";
import Icon02 from "@/public/images/icon-02.svg";
import AddressInput from "@/components/adress-hepler";

interface UpdateBasicEmployeeProps {
  id: string;
  employeeData: EmployeePersonalInformations;
}

export default function UpdateContactCard(
  {employeeData,
  id}:UpdateBasicEmployeeProps 
){
  const value = {
    email: employeeData.email || "",
    phone: employeeData.phone || "",
    acount: employeeData.acount || "",
    adress: employeeData.adress || "",
  };

 const [formState, action] = useActionState(actions.updateEmployeeContact.bind(null,id), {
    errors:{},
  });

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
          Kontakt
          </div>
        </div>
      </div>
      <form action={action}>
        <div className="bg-white dark:bg-slate-800 pt-4 ">
        {formState.errors.uploadError && (
            <Banner type="error" className="mb-4 fixed top-30 z-50 mx-auto">
              {formState.errors.uploadError ? <span>{formState.errors.uploadError}</span> : null}
            </Banner>
          )}
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
              {formState.errors.phone && <span>{formState.errors.phone}</span>}
            </div>
          </div>
          {/* phoneEnd */}
          {/* email Start */}
          <div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="email"
              >
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
              {formState.errors.email && <span>{formState.errors.email}</span>}
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
              {formState.errors.acount && <span>{formState.errors.acount}</span>}
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
                    <AddressInput id="adress" initAddress={value.adress}/>
                    <div className="text-xs mt-1 text-rose-500">
                      {formState.errors.adress && <span>{formState.errors.adress}</span>}
                    </div>
                  </div>
                </div>
                {/* end adresa*/}        
          <div className="flex justify-end items-end p-2 bg-slate-50 dark:bg-slate-800 ">
            <FormButton>Uložit záznam</FormButton>
          </div>
        </div>
      </form>
    </div>
  );
}
