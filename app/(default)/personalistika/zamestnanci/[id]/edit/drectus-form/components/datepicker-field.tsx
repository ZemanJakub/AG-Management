import { useState } from "react";
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
  const [myDate, setmyDate] = useState(defaultValue);

  const handleChange = (selectedDate: Date) => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    if (dateStr !== myDate) {
      // Aktualizace pouze při změně hodnoty
      setmyDate(dateStr);
    }
  };

  return (
    <div className="w-full mb-5">
      <label htmlFor={element.key} className="block text-sm font-medium mb-1">
        {element.label}
      </label>
      <input
        id={element.key}
        name={element.key}
        type="date"
        defaultValue={myDate} // Používáme `defaultValue` místo `value`
        className="form-input w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 px-3 py-2 hidden"
      />
      <Datepicker
        id={element.key}
        defaultValue={defaultValue}
        onChange={handleChange} // Callback pro předání hodnoty
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
