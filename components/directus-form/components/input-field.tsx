import React, { useEffect, useState } from "react";
import { FormElement } from "./types";
import { Input } from "@heroui/react";

interface InputFieldProps {
  element: FormElement;
  defaultValue?: string; // Volitelná výchozí hodnota
  error?: string | any; // Chybová hláška
}

const InputField = ({ element, defaultValue, error }: InputFieldProps) => {
  // Uchováváme hodnotu inputu pomocí useState
  const [inputValue, setInputValue] = useState(defaultValue);

  // Synchronizace defaultValue při změně
  useEffect(() => {
    setInputValue(defaultValue || ""); // Pokud je defaultValue undefined, nastavíme ""
  }, [defaultValue]);

  return (
    <div className="w-full mb-5">
      <label
        htmlFor={element.key}
        className="block text-sm font-medium mb-1 text-left"
      >
        {element.label}
      </label>
      <Input
        variant="bordered"
        id={element.key}
        name={element.key}
        type="text"
        required={element.required}
        value={inputValue} // Používáme řízenou hodnotu
        onChange={(e) => setInputValue(e.target.value)} // Ukládáme změny do stavu
        classNames = {{input:
            "border-none focus:ring-0 focus:outline-none bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-md p-2",}
          
        }
      />
      {error && (
        <div className="text-xs mt-1 text-rose-500">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default InputField;
