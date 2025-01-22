import React, { useEffect } from "react";
import { FormElement } from "./types";
import { Input, InputProps } from "@nextui-org/react";

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
  const inputProps: Pick<InputProps, "labelPlacement" | "classNames"> = {
    labelPlacement: "outside",
    classNames: {
      label:
        "text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700",
      input: [
        "border-none focus:ring-0 focus:outline-none bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-md p-2",
      ],
    },
  };
  const [value, setValue] = React.useState(defaultValue?defaultValue.toString():"");
  useEffect(() => {
    setValue(defaultValue?defaultValue.toString():"");
  }, [defaultValue]);
  const handleIncrement = () => {
    setValue(value === "" ? "1" : (+value + 1).toString());
  };

  const handleDecrement = () => {
    setValue(value === "" ? "-1" : (+value - 1).toString());
  };

  const handleChange = (e: string) => {
    const newValue = e === "" ? "" : e;
    setValue(newValue);
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
        labelPlacement="outside"
         variant="bordered"
        placeholder="0"
        value={value}
        onValueChange={(e) => setValue(e)}
        classNames = {{input:
          "border-none focus:ring-0 focus:outline-none bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-md p-2",}
        
      }
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
