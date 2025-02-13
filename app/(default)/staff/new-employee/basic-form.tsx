"use client";

import React from "react";
import BasicEmployeeForm from "@/components/directus-form/basic-employee-form";

interface Props {
  nextStep: (savedId: string) => void;
  onBack: () => void;
  newEmployeeFormBasicInformations: string;
  employeeId?: string;
}

const BasicFormPage: React.FC<Props> = ({ nextStep, newEmployeeFormBasicInformations, onBack, employeeId }) => {
  const formId = "9f192b09-f334-42e9-b609-78a358223231";

  return (
    <>
      <div className="text-3xl font-bold leading-9 text-gray-900 dark:text-white">
        Základní údaje 👋
      </div>
      <h2 className="py-2 text-lg text-gray-500 dark:text-gray-400 mb-8">
        {newEmployeeFormBasicInformations}
      </h2>
      <BasicEmployeeForm
        nextStep={nextStep}
        onBack={onBack}
        employeeId={employeeId}
        formId={formId}
      />
    </>
  );
};

export default BasicFormPage;

