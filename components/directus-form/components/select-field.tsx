"use client";

import React, { useState, useEffect } from "react";
import { FormElement } from "./types";
import { Select, SelectItem } from "@heroui/react";

interface SelectFieldProps {
  element: FormElement;
  defaultValue: string;
  error?: string | any;
}

const SelectField = ({ element, defaultValue, error }: SelectFieldProps) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  // Synchronizace defaultValue do selectedValue pouze při změně defaultValue
  // useEffect(() => {
  //   if (
  //     element.choices &&
  //     element.choices.some((choice) => choice.value === defaultValue)
  //   ) {
  //     setSelectedValue(defaultValue|| element.defaultValue || "");
  //   } else {
  //     setSelectedValue(""); // Pokud defaultValue neexistuje, nastavíme prázdnou hodnotu
  //   }
  // }, [defaultValue, element.choices]);

    useEffect(() => {
      setSelectedValue(defaultValue?.toString() || element.defaultValue || "");
    }, [defaultValue]);

  const handleChange = (keys: any) => {
    const selected = keys.currentKey; // Získání aktuálního klíče
    setSelectedValue(selected as string);
  };


  return (
    <div className="w-full mb-5">
      <label
        htmlFor={element.key}
        className="block text-sm font-medium mb-1 text-left"
      >
        {element.label}
      </label>
      <Select
      variant="bordered"
        aria-label={element.key}
        selectedKeys={selectedValue ? new Set([selectedValue]) : new Set()}
        id={element.key}
        name={element.key}
        isRequired={element.required}
        placeholder="Vyberte možnost"
        onSelectionChange={handleChange} // Callback pro změnu
      >
        {(element.choices || []).map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </Select>

      {error && (
        <div className="text-xs mt-1 text-rose-500">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default SelectField;
