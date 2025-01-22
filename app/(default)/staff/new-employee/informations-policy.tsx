"use client";

import { Textarea } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

interface InformationsPolicyProps {
  newEmployeeFormDataAgreement: string;
  newEmployeeFormDataAgreementHeading: string;
}
const InformationsPolicy = ({
  newEmployeeFormDataAgreement,newEmployeeFormDataAgreementHeading
}: InformationsPolicyProps) => {
  const [rows, setRows] = useState(1); // Počet řádků
  useEffect(() => {
    const calculateRows = () => {
      const lineHeight = 40; // Výška jednoho řádku v px (závisí na stylu fontu)
      const containerWidth = 500; // Šířka textarey v px
      const lineCharCount = Math.floor(containerWidth / 10); // Odhad počtu znaků na řádku (záleží na font-size)

      const totalLines = Math.ceil(
        newEmployeeFormDataAgreement.length / lineCharCount
      ); // Celkový počet řádků
      setRows(totalLines); // Nastav řádky
    };

    calculateRows(); // Inicializace
  }, [newEmployeeFormDataAgreement]);
  return (
    <div>
      <div className="text-3xl font-bold leading-9 text-default-foreground">
        Zacházení s údaji
      </div>
      <div className="py-4 text-xl font-bold text-secondary-600">
       {newEmployeeFormDataAgreementHeading}
      </div>
      <div className="space-y-4 text-default-foreground">
        <Textarea
          className="text-lg text-center font-medium bg-transparent dark:bg-gray-900 text-gray-900 dark:text-gray-100  p-3 resize-none h-fit border-none shadow-none focus:border-none focus:shadow-none "
          readOnly
          isDisabled
          value={newEmployeeFormDataAgreement}
          minRows={1} // Minimální počet řádků
          maxRows={Infinity} // Povolit růst na základě obsahu
          classNames={{
            innerWrapper: " bg-transparent dark:bg-gray-900 h-full overflow-hidden border-none shadow-none focus:border-none focus:shadow-none",
            inputWrapper: " bg-transparent dark:bg-gray-900 h-fit border-none shadow-none focus:border-none focus:shadow-none",
            input: "h-fit  bg-transparent dark:bg-gray-900 overflow-hidden border-none shadow-none focus:border-none focus:shadow-none text-center",
          }}
        />
      </div>
    </div>
  );
};

export default InformationsPolicy;
