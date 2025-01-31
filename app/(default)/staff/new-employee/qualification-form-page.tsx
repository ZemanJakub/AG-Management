"use client";

import React from "react";

import NewEmployeePersonalForm from "@/components/directus-form/new-employee-personal-form";

interface Props {
  nextStep: () => void;
  onBack: () => void;
  newEmployeeFormQualificationHeading: string;
  employyeeId?: string;
}

const QualificationFormPage = React.forwardRef<HTMLFormElement, Props>(
  (
    { nextStep, newEmployeeFormQualificationHeading, onBack, employyeeId, },
    ref
  ) => {
   
    return (
      <>
        <div className="text-3xl font-bold leading-9 text-default-foreground">
          Kvalifikace a praxe 👋
        </div>
        <div className="py-2 text-medium text-default-500">
          <div className="flex w-full justify-center gap-2 mt-6">
            <h2 className="text-large text-default-500 mb-8">
              {newEmployeeFormQualificationHeading}
            </h2>
          </div>
        </div>
        <NewEmployeePersonalForm
          nextStep={nextStep}
          onBack={onBack}
          employyeeId={employyeeId}
          formId="2ae36aef-f570-4df5-9941-e53123391c90"
        />
      </>
    );
  }
);

QualificationFormPage.displayName = "QualificationFormPage";

export default QualificationFormPage;
