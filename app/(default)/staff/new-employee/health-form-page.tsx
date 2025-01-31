"use client";

import React from "react";

import NewEmployeePersonalForm from "@/components/directus-form/new-employee-personal-form";

interface Props {
  nextStep: () => void;
  onBack: () => void;
  newEmployeeFormHealthHeading: string;
  employyeeId?: string;
}

const HealthFormPage = React.forwardRef<HTMLFormElement, Props>(
  (
    { nextStep, newEmployeeFormHealthHeading, onBack, employyeeId, },
    ref
  ) => {
   
    return (
      <>
        <div className="text-3xl font-bold leading-9 text-default-foreground">
          Zdraví 👋
        </div>
        <div className="py-2 text-medium text-default-500">
          <div className="flex w-full justify-center gap-2 mt-6">
            <h2 className="text-large text-default-500 mb-8">
              {newEmployeeFormHealthHeading}
            </h2>
          </div>
        </div>
        <NewEmployeePersonalForm
          nextStep={nextStep}
          onBack={onBack}
          employyeeId={employyeeId}
          formId="fd85fe0f-467e-4091-bdd3-57efc61cc455"
        />
      </>
    );
  }
);

HealthFormPage.displayName = "HealthFormPage";

export default HealthFormPage;
