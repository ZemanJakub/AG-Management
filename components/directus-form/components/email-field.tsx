import React, { useEffect, useState } from "react";
import { FormElement } from "./types";
import { Input, InputProps } from "@nextui-org/react";

interface EmailInputFieldProps {
  element: FormElement;
  defaultValue: string;
  error?: string | any;
}
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
    if (isValidEmail(newValue)) {
      setEmailValue(newValue);
    }
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
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
          @
        </span>
        <Input
          id={element.key}
          name={element.key}
          variant="bordered"
          type="email"
          required={element.required}
          value={emailValue} // Používáme řízenou hodnotu
          onChange={handleChange} // Ukládáme změny do stavu
          classNames={{
            input:
              "border-none focus:ring-0 focus:outline-none bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-md p-2",
          }}
          // className="form-input w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 px-3 py-2 pl-8" // pl-8 přidá odsazení pro zavináč
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
