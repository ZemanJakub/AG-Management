"use client";

import React from "react";

import NewEmployeeFeedbackForm from "@/components/directus-form/new-employee-feedback-form";


interface Props {
  nextStep: () => void;
  onBack: () => void;
  newEmployeeFormHowDidYouFindUsHeading: string;
  employyeeId?: string;
}

const HowDidYouFindUsFormPage = React.forwardRef<HTMLFormElement, Props>(
  (
    { nextStep, newEmployeeFormHowDidYouFindUsHeading, onBack, employyeeId, },
    ref
  ) => {
   
    return (
      <>
        <div className="text-3xl font-bold leading-9 text-default-foreground">
          Jak jsi nás našel? 👋
        </div>
        <div className="py-2 text-medium text-default-500">
          <div className="flex w-full justify-center gap-2 mt-6">
            <h2 className="text-large text-default-500 mb-8">
              {newEmployeeFormHowDidYouFindUsHeading}
            </h2>
          </div>
        </div>
        <NewEmployeeFeedbackForm
          nextStep={nextStep}
          onBack={onBack}
          employyeeId={employyeeId}
        />
      </>
    );
  }
);

HowDidYouFindUsFormPage.displayName = "HowDidYouFindUsFormPage";

export default HowDidYouFindUsFormPage;
