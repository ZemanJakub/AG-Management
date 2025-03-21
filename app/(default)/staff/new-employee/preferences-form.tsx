"use client";

import React from "react";

import NewEmployeePersonalForm from "@/components/directus-form/new-employee-personal-form";

interface Props {
  nextStep: () => void;
  onBack: () => void;
  newEmployeeFormPreferencesHeading: string;
  employyeeId?: string;
}

const PreferencesFormPage = React.forwardRef<HTMLFormElement, Props>(
  (
    { nextStep, newEmployeeFormPreferencesHeading, onBack, employyeeId, },
    ref
  ) => {
   
    return (
      <>
        <div className="text-3xl font-bold leading-9 text-default-foreground">
          Preference 👋
        </div>
        <div className="py-2 text-medium text-default-500">
          <div className="flex w-full justify-center gap-2 mt-6">
            <h2 className="text-large text-default-500 mb-8">
              {newEmployeeFormPreferencesHeading}
            </h2>
          </div>
        </div>
        <NewEmployeePersonalForm
          nextStep={nextStep}
          onBack={onBack}
          employyeeId={employyeeId}
          formId="d4c47ec3-3243-4ec5-8738-cb6b332dafc4"
        />
      </>
    );
  }
);

PreferencesFormPage.displayName = "PersonalForm";

export default PreferencesFormPage;
