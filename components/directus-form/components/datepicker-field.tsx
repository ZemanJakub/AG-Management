import { useState, useEffect } from "react";
import { FormElement } from "./types";
import Datepicker from "./datepicker";

interface DatePickerFieldProps {
  element: FormElement;
  defaultValue: string; // Hlavní hodnota formuláře
  error?: string | any; // Chybová hláška
}

const DatePickerField = ({
  element,
  defaultValue,
  error,
}: DatePickerFieldProps) => {
  const formatDefaultValue = (value: string): string | null => {
    if (!value || value.trim() === "") {
      return null; // Prázdný řetězec se změní na null
    }
    const isValid = /^\d{4}-\d{2}-\d{2}$/.test(value); // Kontrola formátu YYYY-MM-DD
    if (!isValid) {
      console.error("Invalid defaultValue format:", value);
      return null; // Pokud je formát špatný, vracíme null
    }
    return value;
  };

  const [myDate, setmyDate] = useState<string | null>(
    formatDefaultValue(defaultValue)
  );

  useEffect(() => {
    setmyDate(formatDefaultValue(defaultValue)); // Synchronizace při změně `defaultValue`
  }, [defaultValue]);

  const handleChange = (selectedDate: Date) => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    if (dateStr !== myDate) {
      setmyDate(dateStr); // Aktualizace stavu pouze při změně
    }
  };

  return (
    <div className="w-full mb-5">
      <label
        htmlFor={element.key}
        className="block text-sm font-medium mb-1 text-left"
      >
        {element.label}
      </label>
      <input
        id={element.key}
        name={element.key}
        type="date"
        defaultValue={myDate || ""} // Pokud je null, použije se prázdný řetězec
        className="form-input w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 px-3 py-2 hidden"
      />
      <Datepicker
        id={element.key}
        defaultDate={myDate || ""} // Pokud je null, předáme prázdný řetězec
        onChange={handleChange} // Callback pro předání hodnoty
        required={element.required}
      />
      {error && (
        <div className="text-xs mt-1 text-rose-500">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DatePickerField;
