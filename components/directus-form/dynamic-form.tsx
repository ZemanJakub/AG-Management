"use client";

import { useActionState } from "react";
import * as actions from "@/actions";
import { MyFormData } from "./components/types";
import InputField from "./components/input-field";
import TextareaField from "./components/textarea-field";
import SelectField from "./components/select-field";
import DatePickerField from "./components/datepicker-field";
import NumberInput from "./components/number-field";
import EmailInputField from "./components/email-field";
import Form from 'next/form'

import AddressField from "./components/adress-field";
import { Button } from "@heroui/react";

interface FormComponentProps {
  formData: MyFormData;
  id: string;
}

const DynamicFormComponent = ({ formData, id }: FormComponentProps) => {
  const sortedElements = formData.elements.sort((a, b) => a.order - b.order);

  const initialValues = formData.elements.reduce((values, element) => {
    values[element.key] = "";
    return values;
  }, {} as Record<string, any>);



  const [state, action, isPending] = useActionState(
    actions.updatePersonalEmployeeDynamic,
    null
  );

  return (
    <Form action={action} className="bg-white dark:bg-slate-900 h-full">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="uploadError" value="" />
      <div className="flex justify-center md:justify-start">
        <div className="relative">
          <div className="px-4 sm:px-6 py-2 w-full max-w-[96rem] mx-auto">
            <h2 className="text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6">
              Údaje z přijímacího řízení
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {sortedElements.map((element) => {
                const colSpanClass =
                  element.type === "textarea" ? "md:col-span-3" : "";

                switch (element.type) {
                  case "input":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <InputField
                          defaultValue={initialValues[element.key]}
                          element={element}
                          error={state?.[element.key]}
                        />
                      </div>
                    );
                  case "textarea":
                    return (
                      <div
                        key={element.id}
                        className={`${colSpanClass} w-full`}
                      >
                        <TextareaField
                          defaultValue={initialValues[element.key]}
                          element={element}
                          error={state?.[element.key]} // Předání chyby do komponenty
                        />
                      </div>
                    );

                  case "select":
                    return (
                      <div key={element.id} className="w-full mb-5">
                        <SelectField
                          element={element}
                          defaultValue={initialValues[element.key]}
                          error={state?.[element.key]}
                        />
                      </div>
                    );
                  case "date":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <DatePickerField
                          defaultValue={initialValues[element.key]?.toString()}
                          element={element}
                          error={state?.[element.key]}
                        />
                      </div>
                    );
                  case "address":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <AddressField
                          element={element}
                          defaultValue={initialValues[element.key]?.toString()}
                          error={state?.[element.key]}
                        />
                      </div>
                    );
                  case "number":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <NumberInput
                          defaultValue={initialValues[element.key]?.toString()}
                          element={element}
                          error={state?.[element.key]}
                        />
                      </div>
                    );
                  case "email":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <EmailInputField
                          defaultValue={initialValues[element.key]?.toString()}
                          element={element}
                          error={state?.[element.key]}
                        />
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
            <div className="flex justify-center items-center p-6">
              <Button
                type="submit"
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={isPending}
              >
                Uložit záznam
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default DynamicFormComponent;
