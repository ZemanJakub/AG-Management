import React, { useState } from "react";
import { FormElement } from "./types";

interface InputFieldProps {
  element: FormElement;
  defaultValue: string; // Výchozí hodnota
  error?: string | any; // Chybová hláška
}

const InputField = ({ element, defaultValue, error }: InputFieldProps) => {
  // Uchováváme hodnotu inputu pomocí useState
  const [inputValue, setInputValue] = useState(defaultValue);

  return (
    <div className="w-full mb-5">
      <label htmlFor={element.key} className="block text-sm font-medium mb-1">
        {element.label}
      </label>
      <input
        id={element.key}
        name={element.key}
        type="text"
        required={element.required}
        value={inputValue} // Používáme řízenou hodnotu
        onChange={(e) => setInputValue(e.target.value)} // Ukládáme změny do stavu
        className="form-input w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 px-3 py-2"
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

