import React, { startTransition, useRef } from "react";
import { useEffect, useState } from "react";
import {
  fetchEmployeeBasicInformations,
  fetchMyForm,
} from "@/db/queries/employees";
import { useActionState } from "react";
import * as actions from "@/actions";
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
import { Button, Spinner } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";

interface Props {
  nextStep: (savedId: string) => void;
  onBack: () => void;
  employyeeId?: string;
}

const BasicEmployeeForm = ({ nextStep, onBack, employyeeId }: Props) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({}); // Hodnoty formuláře
  const [formData, setFormData] = useState<MyFormData | null>(null);
  const [state, action, isPending] = useActionState(
    actions.updateBasicEmployeeDynamic,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  // useEffect(() => {
  //   console.log("Updated formValues:", formValues);
  // }, [formValues]);

  // Načtení struktury formuláře při prvním renderování
  useEffect(() => {
    const fetchFormStructure = async () => {
      try {
        const data = await fetchMyForm("0c149237-74b8-4a4c-b741-f473d13b2d4b");
        setFormData(data[0] as MyFormData); // Ulož strukturu formuláře

        // Inicializuj formValues s prázdnými hodnotami
        if (employyeeId !== undefined && employyeeId !== "") {
          console.log(employyeeId, "employyeeId");
          const fetchSavedData = async (id: string) => {
            try {
              const savedData = await fetchEmployeeBasicInformations(id); // Funkce pro načtení dat podle savedId
              // Aktualizace hodnot ve formValues

              const merged = { ...formValues, ...savedData }; // Sloučení hodnot
              console.log("if employyyee data merged values:", merged); // Log sloučených hodnot
              setFormValues(merged); // Nastavení sloučeného stavu
              console.log(formValues, "employyeeId init formValues");
            } catch (error) {
              console.error("Error fetching saved data:", error);
            }
          };
          fetchSavedData(employyeeId); // Pokud máme uložené ID, načteme data
        } else {
          const initialValues = data[0].elements.reduce(
            (values: any, element: any) => {
              values[element.key] = ""; // Každá hodnota je prázdná
              return values;
            },
            {} as Record<string, any>
          );
          setFormValues(initialValues);
          console.log("else employyeeId init formValues");
        }
      } catch (error) {
        console.error("Error fetching form structure:", error);
      }
    };
    fetchFormStructure();
  }, []);

  // Načtení uložených dat po získání `savedId`  - pokud je k dispozici
  useEffect(() => {
    if (state?.savedId) {
      toast.dismiss();
      toast.success("Data byla v pořádku uložena...", {
        autoClose: 2000,
        hideProgressBar: true,
        theme: "dark",
      });
      nextStep(state.savedId); // Bezpečné volání mimo renderovací fázi
    }
  }, [state?.savedId]);

  // useEffect(() => {
  //   // Načtení dat při montování komponenty
  //   const fetchData = async () => {
  //     try {
  //       const data = await fetchMyForm("0c149237-74b8-4a4c-b741-f473d13b2d4b");
  //       setFormData(data[0] as MyFormData);
  //     } catch (error) {
  //       console.error("Error fetching form data:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // // Reagujeme na změnu `state?.savedId` a přecházíme na další krok
  // useEffect(() => {
  //   if (state?.savedId) {
  //     toast.dismiss();
  //     toast.success("Data byla v pořádku uložena...", {
  //       autoClose: 2000,
  //       hideProgressBar: true,
  //       theme: "dark",
  //     });
  //     nextStep(state.savedId); // Bezpečné volání mimo renderovací fázi
  //   }
  // }, [state?.savedId, nextStep]);

  if (!formData) {
    return <Spinner color="warning" label="Načítám formulář..." size="lg" />;
  }

  const sortedElements = formData.elements.sort((a, b) => a.order - b.order);

  // const initialValues = formData.elements.reduce((values, element) => {
  //   values[element.key] = "";
  //   return values;
  // }, {} as Record<string, any>);

  const background = "--nextui-background";
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
      <input type="hidden" name="id" value={state?.savedId || ""} />
      <input type="hidden" name="uploadError" value="" />
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
                          defaultValue={formValues[element.key]}
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
                          defaultValue={formValues[element.key]}
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
                          defaultValue={formValues[element.key]}
                          error={state?.errors?.[element.key]}
                        />
                      </div>
                    );
                  case "date":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <DatePickerField
                          defaultValue={formValues[element.key]?.toString()}
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
                          defaultValue={formValues[element.key]?.toString()}
                          error={state?.errors?.[element.key]}
                        />
                      </div>
                    );
                  case "number":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <NumberInput
                          defaultValue={formValues[element.key]?.toString()}
                          element={element}
                          error={state?.errors?.[element.key]}
                        />
                      </div>
                    );
                  case "email":
                    return (
                      <div key={element.id} className={colSpanClass}>
                        <EmailInputField
                          defaultValue={formValues[element.key]?.toString()}
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

export default BasicEmployeeForm;
