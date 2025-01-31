import React, { useEffect, useState } from "react";
import { FormElement } from "./types";
import { Input, InputProps } from "@heroui/react";

interface EmailInputFieldProps {
  element: FormElement;
  defaultValue: string;
  error?: string | any;
}
const EmailInputField = ({
  element,
  defaultValue,
  error,
}: EmailInputFieldProps) => {
  // Uchování hodnoty emailu pomocí useState

  const [emailValue, setEmailValue] = useState(defaultValue);
  useEffect(() => {
    setEmailValue(defaultValue || "");
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEmailValue(newValue); // Vždy aktualizuj stav
  };
  
  return (
    <div className="w-full mb-5 relative">
      <label
        className="block text-sm font-medium mb-1 text-left"
        htmlFor={element.key}
      >
        {element.label}
      </label>
      <div className="relative">
        <Input
          id={element.key}
          name={element.key}
          variant="bordered"
          type="email"
          required={element.required}
          value={emailValue}
          onChange={handleChange}
          classNames={{
            input:
              "border-none focus:ring-0 focus:outline-none bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-md p-2",
          }}
        />
      </div>
      {error && (
        <div className="text-xs mt-1 text-rose-500">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};  

export default EmailInputField;
