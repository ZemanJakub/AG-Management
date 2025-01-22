"use client";

import React from "react";

import PersonalEmployeeForm from "@/components/directus-form/personal-employee-form";

interface Props {
  nextStep: (savedId:string) => void;
  onBack: () => void;
  newEmployeeFormPersonalInformationsHeading: string;
  employyeeId?: string;
}


const PersonalFormPage = React.forwardRef<HTMLFormElement, Props>(
  ({nextStep,newEmployeeFormPersonalInformationsHeading,onBack,employyeeId},ref) => {

//10839920-470a-4711-a11d-8f82b282153f  - formId


//Nahraj nám prosím svou fotografii, nebo se pomocí zařízení které používáš vyfoť.

    return (
      <>
        <div className="text-3xl font-bold leading-9 text-default-foreground">
          Ostatní údaje 👋
        </div>
        <div className="py-2 text-medium text-default-500">
        <div className="flex w-full justify-center gap-2 mt-6">
        <h2 className="text-large text-default-500 mb-8">
          {newEmployeeFormPersonalInformationsHeading}
         </h2>

        </div>
      </div>
      <PersonalEmployeeForm nextStep={nextStep} onBack={onBack} employyeeId={employyeeId}/>
      </>
    );
  },
);

PersonalFormPage.displayName = "PersonalForm";

export default PersonalFormPage;
