"use client";

import React, { useState, useEffect } from "react";
import { FormElement } from "./types";

interface SelectFieldProps {
  element: FormElement;
  defaultValue: string;
  error?: string | any;
}

const SelectField = ({ element, defaultValue, error }: SelectFieldProps) => {
  // Uchování vybrané hodnoty pomocí useState
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  // Synchronizace defaultValue do selectedValue pouze při změně defaultValue, nikoli při každém renderu
  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="w-full mb-5">
      <label htmlFor={element.key} className="block text-sm font-medium mb-1">
        {element.label}
      </label>
      <select
        id={element.key}
        name={element.key}
        required={element.required}
        value={selectedValue} // Používáme řízenou hodnotu
        onChange={(e) => setSelectedValue(e.target.value)} // Aktualizujeme stav při změně
        className="form-select w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 px-3 py-2"
      >
        {element.required && (
          <option value="" disabled>
            Vyberte...
          </option>
        )}
        {element.choices?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="text-xs mt-1 text-rose-500">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default SelectField;

