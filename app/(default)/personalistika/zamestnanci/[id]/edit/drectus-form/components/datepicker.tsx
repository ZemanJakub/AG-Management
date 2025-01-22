import { useEffect, useState } from "react";
import { Calendar } from "@nextui-org/calendar";
import { I18nProvider } from "@react-aria/i18n";
import { parseDate, CalendarDate } from "@internationalized/date";

export default function Datepicker({
  align,
  defaultValue,
  bdate,
  id,
  required,
  onChange,
}: {
  align?: "left" | "right";
  defaultValue?: string;
  bdate?: boolean;
  id: string;
  required?: boolean;
  onChange?: (date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);

  useEffect(() => {
    if (defaultValue && defaultValue.trim()) {
      const date = new Date(defaultValue);
      if (!isNaN(date.getTime())) {
        const parsedDate = parseDate(
          `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        );
        setSelectedDate(parsedDate);
        onChange?.(date);
      }
    }
  }, [defaultValue, onChange]);

  const handleDateChange = (newDate: CalendarDate | null) => {
    setSelectedDate(newDate);
    if (newDate) {
      const jsDate = new Date(newDate.year, newDate.month - 1, newDate.day);
      onChange?.(jsDate); // Callback s JavaScriptovým datem
    }
  };

  return (
    <I18nProvider locale="cs-CZ">
      <div className={`relative w-full ${align === "right" ? "text-right" : ""}`}>
        <Calendar
          aria-label="Datum (mezinárodní kalendář)"
          value={selectedDate}
          minValue={
            bdate
              ? parseDate(
                  `${new Date().getFullYear() - 75}-${
                    new Date().getMonth() + 1
                  }-${new Date().getDate()}`
                )
              : undefined
          }
          maxValue={
            bdate
              ? parseDate(
                  `${new Date().getFullYear() - 15}-${
                    new Date().getMonth() + 1
                  }-${new Date().getDate()}`
                )
              : undefined
          }
          onChange={handleDateChange}
        />
      </div>
    </I18nProvider>
  );
}
