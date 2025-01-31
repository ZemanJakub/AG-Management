"use client";

import type { InputProps } from "@heroui/react";

import React from "react";
import UpdatePhoto from "./update-photo";
import BasicEmployeeForm from "@/components/directus-form/basic-employee-form";

interface Props {
  nextStep: (savedId: string) => void;
  onBack: () => void;
  newEmployeeFormBasicInformations: string;
  employyeeId?: string;
}

const BasicFormPage = React.forwardRef<HTMLFormElement, Props>(
  (
    { nextStep, newEmployeeFormBasicInformations, onBack, employyeeId },
    ref
  ) => {
    const formId = "9f192b09-f334-42e9-b609-78a358223231";

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
        </div>
        <BasicEmployeeForm
          nextStep={nextStep}
          onBack={onBack}
          employyeeId={employyeeId}
          formId={formId}
        />
      </>
    );
  }
);

BasicFormPage.displayName = "BasicForm";

export default BasicFormPage;
