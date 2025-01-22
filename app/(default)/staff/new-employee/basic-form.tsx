"use client";

import type {InputProps} from "@nextui-org/react";

import React from "react";
import UpdatePhoto from "./update-photo";
import BasicEmployeeForm from "@/components/directus-form/basic-employee-form";

interface Props {
  nextStep: (savedId:string) => void;
  onBack: () => void;
  newEmployeeFormBasicInformations: string;
  employyeeId?: string;
}


const BasicFormPage = React.forwardRef<HTMLFormElement, Props>(
  ({nextStep,newEmployeeFormBasicInformations,onBack,employyeeId},ref) => {

    const id = "1";
    const employeeData = {
      firstName: "Karel",
      secondName: "Kopecký",
      photo: `699729d7-e5fb-48e8-930c-6510fc06eb03`,
    };

    return (
      <>
        <div className="text-3xl font-bold leading-9 text-default-foreground">
          Základní údaje 👋
        </div>
        <div className="py-2 text-medium text-default-500">
        <div className="flex w-full justify-center gap-2 mt-6">
        <h2 className="text-large text-default-500 mb-8">
          {newEmployeeFormBasicInformations}
        </h2>

        </div>
        {/* <div
          className={`grow bg-white dark:bg-slate-900 flex flex-col md:translate-x-0 transition-transform duration-300 ease-in-out translate-x-0`}>
          <div className="relative h-40 w-full  rounded-full mt-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <UpdatePhoto
                id={id}
                photo={employeeData.photo}
                firstName={employeeData.firstName}
                secondName={employeeData.secondName}
              />
            </div>
          </div>
        </div> */}
      </div>
      <BasicEmployeeForm nextStep={nextStep} onBack={onBack} employyeeId={employyeeId}/>
      </>
    );
  },
);

BasicFormPage.displayName = "BasicForm";

export default BasicFormPage;
