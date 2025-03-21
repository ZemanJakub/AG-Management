import React, { useRef, useEffect } from "react";
import {
  fetchEmployeePersonalInformations,
  fetchMyForm,
} from "@/db/queries/employees";
import { useActionState } from "react";
import {personalEmployeeData} from "@/actions";
import { MyFormData } from "./components/types";
import InputField from "./components/input-field";
import TextareaField from "./components/textarea-field";
import SelectField from "./components/select-field";
import DatePickerField from "./components/datepicker-field";
import NumberInput from "./components/number-field";
import EmailInputField from "./components/email-field";
import Form from "next/form";
import { startsWith } from "lodash";
import AddressField from "./components/adress-field";
import { Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import useSWR from "swr";

interface Props {
  nextStep: () => void;
  onBack: () => void;
  employyeeId?: string;
  formId?: string;
}

const NewEmployeePersonalForm = ({ nextStep, onBack, employyeeId, formId }: Props) => {
  const [state, action, isPending] = useActionState(
    personalEmployeeData,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  const { data: employeeData, error: employeeError } = useSWR(
    employyeeId ? employyeeId : null, 
    fetchEmployeePersonalInformations
  );

  const { data: formStructure, error: formStructureError } = useSWR(
    formId ? formId : null, 
    fetchMyForm
  );

  useEffect(() => {
    if (state?.savedId) {
      toast.dismiss();
      toast.success("Data byla v pořádku uložena...", {
        autoClose: 2000,
        hideProgressBar: true,
        theme: "dark",
      });
      nextStep(); // Bezpečné volání mimo renderovací fázi
    }
    if(state?.uploadError) {
      toast.dismiss();
      toast.error("Data se nepodařilo uložit...", {
        autoClose: 8000,
        hideProgressBar: true,
        theme: "dark",
      });
    }
  }, [state?.savedId, state?.uploadError]);

  if (employeeError || formStructureError) {
    toast.dismiss();
    toast.error("Potřebná data se nepodařilo načís...", {
      autoClose: 8000,
      hideProgressBar: true,
      theme: "dark",
    });
  }

  if (!formStructure) {
    return <Spinner color="warning" label="Načítám formulář..." size="lg" />;
  }

const formData = formStructure[0] as MyFormData;

const allowedKeys = formData.elements.map((element: any) => element.key);


const filteredEmployeeData = employeeData
  ? Object.keys(employeeData)
      .filter((key) => allowedKeys.includes(key))
      .reduce((obj: Record<string, any>, key: string) => {
        obj[key] = employeeData[key as keyof typeof employeeData]; // Bezpečný přístup
        return obj;
      }, {})
  : {};



const initialValues = allowedKeys.reduce((values: any, key: string) => {
  values[key] = filteredEmployeeData[key] || ""; // Prázdné hodnoty pro nový záznam
  return values;
}, {});



  const sortedElements = formData.elements.sort((a, b) => a.order - b.order);

  const background = "--heroui-background";
  const linearGradientBg = startsWith(background, "--")
    ? `hsl(var(${background}))`
    : background;

  const style = {
    border: "solid 2px transparent",
    backgroundImage: `linear-gradient(${linearGradientBg}, ${linearGradientBg}), linear-gradient(to right, #4051a0, #9353D3)`,
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  };


  
  return (
    <Form action={action} ref={formRef} className=" h-full">
      <input
        type="hidden"
        name="id"
        value={employyeeId}
        aria-hidden={true}
      />
       <input
        type="hidden"
        name="formId"
        value={formId}
        aria-hidden={true}
      />
      <input type="hidden" name="uploadError" value="" aria-hidden={true} />
      <div className="flex justify-center md:justify-center">
        <div className="relative">
          <div className="px-4 sm:px-6 py-2 w-full max-w-[96rem] mx-auto">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sortedElements.map((element) => {
                const colSpanClass =
                  element.type === "textarea" ? "md:col-span-2" : "";

                switch (element.type) {
                  case "input":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <InputField
                          defaultValue={initialValues[element.key]}
                          element={element}
                          error={state?.errors?.[element.key]}
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
                          error={state?.errors?.[element.key]}
                        />
                      </div>
                    );
                  case "select":
                    return (
                      <div key={element.id} className="w-full mb-5">
                        <SelectField
                          element={element}
                          defaultValue={initialValues[element.key]}
                          error={state?.errors?.[element.key]}
                        />
                      </div>
                    );
                  case "date":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <DatePickerField
                          defaultValue={initialValues[element.key]?.toString()}
                          element={element}
                          error={state?.errors?.[element.key]}
                        />
                      </div>
                    );
                  case "address":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <AddressField
                          element={element}
                          defaultValue={initialValues[element.key]?.toString()}
                          error={state?.errors?.[element.key]}
                        />
                      </div>
                    );
                  case "number":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <NumberInput
                          defaultValue={initialValues[element.key]?.toString()}
                          element={element}
                          error={state?.errors?.[element.key]}
                        />
                      </div>
                    );
                  case "email":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <EmailInputField
                          defaultValue={initialValues[element.key]?.toString()}
                          element={element}
                          error={state?.errors?.[element.key]}
                        />
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>

            <div className="mx-auto my-6 flex w-full items-center justify-center gap-x-4 lg:mx-0">
              <Button
                className="rounded-medium border-default-200 text-medium font-medium text-default-500 w-32"
                variant="bordered"
                onPress={onBack}
              >
                <Icon icon="solar:arrow-left-outline" width={24} />
                Zpět
              </Button>

              <Button
                className="text-medium font-medium"
                type="button"
                disabled={isPending}
                onPress={() => {
                  formRef.current?.requestSubmit(); // Ruční odeslání formuláře
                  toast.dismiss();
                  toast.info("Ukládám data...", {
                    autoClose: 8000,
                    hideProgressBar: false,
                    theme: "dark",
                  });
                }}
                style={style}
              >
                Pokračovat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default NewEmployeePersonalForm;
