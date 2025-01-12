import React from "react";
import { FormElement } from "./types";

interface NumberInputFieldProps {
  element: FormElement;
  defaultValue: number | string; // Propojení s formulářovým stavem
  error?: string | any; // Chybová hláška
}

const NumberInput = ({
  element,
  defaultValue,
  error,
}: NumberInputFieldProps) => {
  const [value, setValue] = React.useState(defaultValue);
  const handleIncrement = () => {
    setValue(value === "" ? 1 : +value + 1);
  };

  const handleDecrement = () => {
    setValue(value === "" ? -1 : +value - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? "" : +e.target.value;
    setValue(newValue);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1" htmlFor={element.key}>
        {element.label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={handleDecrement}
          className="absolute left-0 inset-y-0 px-5 py-2 bg-gray-200 dark:bg-slate-700 rounded-l-md text-slate-700 dark:text-slate-100"
        >
          -
        </button>
        <input
          id={element.key}
          name={element.key}
          type="number"
          required={element.required}
          value={value} // Propojení s formulářovým stavem
          onChange={handleChange} // Aktualizace při změně
          className="form-input w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 pl-12 pr-12 text-center appearance-none"
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="absolute right-0 inset-y-0 px-5 py-2 bg-gray-200 dark:bg-slate-700 rounded-r-md text-slate-700 dark:text-slate-100"
        >
          +
        </button>
      </div>
      {error && (
        <div className="text-xs mt-1 text-rose-500">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default NumberInput;
