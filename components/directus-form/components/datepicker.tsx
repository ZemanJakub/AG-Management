import { useEffect, useState } from "react";
import { I18nProvider } from "@react-aria/i18n";
import { parseDate, CalendarDate } from "@internationalized/date";
import { DatePicker } from "@nextui-org/react";

export default function Datepicker({
  align,
  defaultDate,
  id,
  required,
  onChange,
}: {
  align?: "left" | "right";
  defaultDate?: string; // Očekávaný formát "YYYY-MM-DD"
  id: string;
  required?: boolean;
  onChange?: (date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);

  useEffect(() => {
    if (defaultDate) {
      const parsedDate = parseDate(defaultDate); // Převod na CalendarDate
      setSelectedDate(parsedDate);

      // Převod na JavaScriptové datum pro callback
      const [year, month, day] = defaultDate.split("-").map(Number);
      const jsDate = new Date(Date.UTC(year, month - 1, day));
      onChange?.(jsDate);
    }
  }, [defaultDate, onChange]);

  const handleDateChange = (newDate: CalendarDate | null) => {
    setSelectedDate(newDate);
    if (newDate) {
      const jsDate = new Date(Date.UTC(newDate.year, newDate.month - 1, newDate.day));
      onChange?.(jsDate);
    }
  };

  return (
    <I18nProvider locale="cs-CZ">
      <div
        className={`relative w-full ${align === "right" ? "text-right" : ""}`}
      >
        <DatePicker
          variant="bordered"
          //  classNames={{
          //   inputWrapper: "bg-primary-200 dark:bg-primary-800",
          //   input: "bg-primary-200 dark:bg-primary-800", // Barvy pro světlý a tmavý režim
          // }}
          value={selectedDate}
          onChange={handleDateChange}
          aria-label={id}
        />
      </div>
    </I18nProvider>
  );
}
