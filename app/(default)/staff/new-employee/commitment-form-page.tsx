"use client";

import React from "react";

import NewEmployeePersonalForm from "@/components/directus-form/new-employee-personal-form";

interface Props {
  nextStep: () => void;
  onBack: () => void;
  newEmployeeFormCommitmentHeading: string;
  employyeeId?: string;
}

const CommitmentFormPage = React.forwardRef<HTMLFormElement, Props>(
  (
    { nextStep, newEmployeeFormCommitmentHeading, onBack, employyeeId, },
    ref
  ) => {
   
    return (
      <>
        <div className="text-3xl font-bold leading-9 text-default-foreground">
          Závazky 👋
        </div>
        <div className="py-2 text-medium text-default-500">
          <div className="flex w-full justify-center gap-2 mt-6">
            <h2 className="text-large text-default-500 mb-8">
              {newEmployeeFormCommitmentHeading}
            </h2>
          </div>
        </div>
        <NewEmployeePersonalForm
          nextStep={nextStep}
          onBack={onBack}
          employyeeId={employyeeId}
          formId="8882a599-b5c2-4065-b008-5ab50cadd97e"
        />
      </>
    );
  }
);

CommitmentFormPage.displayName = "CommitmentFormPage";

export default CommitmentFormPage;
