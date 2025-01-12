import Flatpickr from 'react-flatpickr';
import { Hook, Options } from 'flatpickr/dist/types/options';
import { useEffect } from "react";
import { Czech } from 'flatpickr/dist/l10n/cs.js';

export default function Datepicker({
  align,
  defaultValue,
  bdate,
  id,
  required,
  onChange,
}: {
  align?: 'left' | 'right';
  defaultValue?: string;
  bdate?: boolean;
  id: string;
  required?: boolean;
  onChange?: (date: Date) => void;
}) {
  useEffect(() => {
    if (defaultValue && defaultValue.trim()) {
      const date = new Date(defaultValue);
      if (!isNaN(date.getTime()) && onChange) {
        // Zavoláme onChange pouze tehdy, pokud defaultValue obsahuje platné datum
        onChange(date);
      }
    }
  }, [defaultValue, onChange]);

  const defaultDateConstructor = (defaultValue: string) => {
    if (defaultValue && defaultValue.trim()) {
      const date = new Date(defaultValue);
      return !isNaN(date.getTime()) ? date : undefined;
    }
    return undefined; // Pokud není defaultValue nebo je neplatné, nevracíme výchozí datum
  };

  const onReady: Hook = (selectedDates, dateStr, instance) => {
    // Můžete přidat vlastní nastavení v případě potřeby
  };

  const handleDateChange: Hook = (selectedDates, dateStr, instance) => {
    if (onChange && selectedDates.length > 0) {
      onChange(selectedDates[0]);
    }
  };

  const options: Options = {
    mode: 'single',
    locale: Czech,
    static: true,
    monthSelectorType: 'static',
    dateFormat: 'j, M, Y',
    position: align === 'right' ? 'above right' : 'above left',
    defaultDate: defaultDateConstructor(defaultValue as string),
    minDate: bdate ? new Date().setDate(new Date().getDate() - 27375) : undefined,
    maxDate: bdate ? new Date().setDate(new Date().getDate() - 5475) : undefined,
    prevArrow: '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
    nextArrow: '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
    onReady,
    onChange: handleDateChange, // Callback pro volání onChange při skutečné změně
  };

  return (
    <div className="relative w-full">
      <Flatpickr
        className="w-full form-input pl-9 text-slate-500 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200 font-medium bg-white dark:bg-slate-900"
        options={options}
        name={id}
        id={id}
        required={required}
      />
      <div className="absolute inset-0 flex items-center pointer-events-none w-full">
        <svg className="w-4 h-4 fill-current text-slate-500 dark:text-slate-400 ml-3" viewBox="0 0 16 16">
          <path d="M15 2h-2V0h-2v2H9V0H7v2H5V0H3v2H1a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V3a1 1 0 00-1-1zm-1 12H2V6h12v8z" />
        </svg>
      </div>
    </div>
  );
}
