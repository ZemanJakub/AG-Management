import React, { useEffect, useState } from "react";
import { FormElement } from "./types";
import { Input } from "@heroui/react";

interface NumberInputFieldProps {
  element: FormElement;
  defaultValue: number | string; // Propojení s formulářovým stavem
  error?: string | null | any; // Chybová hláška
}

const NumberInput = ({ element, defaultValue, error }: NumberInputFieldProps) => {
  const [value, setValue] = useState(defaultValue?.toString() || "");
  useEffect(() => {
    setValue(defaultValue?.toString() || element.defaultValue || "");
  }, [defaultValue]);

  const handleChange = (inputValue: string) => {
    if (/^-?\d*\.?\d*$/.test(inputValue)) { // Povolené pouze číslice, tečka a mínus na začátku
      setValue(inputValue);
    }
  };

  return (
    <div>
      <label
        className="block text-sm font-medium mb-1 text-left"
        htmlFor={element.key}
      >
        {element.label}
      </label>

      <Input
        id={element.key}
        name={element.key}
        variant="bordered"
        placeholder="100"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        step={element.step}
        classNames={{
          input:
            "border-none focus:ring-0 focus:outline-none bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-md p-2",
        }}
        type="number"
      />

      {error && (
        <div className="text-xs mt-1 text-rose-500">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default NumberInput;
