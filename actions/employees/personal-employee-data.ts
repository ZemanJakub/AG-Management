"use server";

import { z } from "zod";
import { directus } from "@/app/lib/directus";
import { createItem, readItems, updateItem } from "@directus/sdk";
import { TransformToFieldErrorsType } from "@/components/utils/utils";

import { fetchMyForm } from "@/db/queries/employees";
import { MyFormData } from "@/components/directus-form/components/types";
import { generateSchema } from "@/components/directus-form/components/schema";

async function loadCustomFormStructure(formId: string): Promise<MyFormData> {
  const dynamicformData = await fetchMyForm(formId);
  const formData = dynamicformData[0] as unknown as MyFormData;

  return {
    id: formData.id,
    name: formData.name,
    elements: formData.elements.map((element: any) => ({
      id: element.id,
      key: element.key,
      label: element.label,
      type: element.type,
      required: element.required,
      choices: element.choices || [],
      order: element.order,
    })),
  };
}


export async function personalEmployeeData(
  prevState: any,
  formData: FormData // FormData z Web API
): Promise<{
  errors: TransformToFieldErrorsType<
    z.infer<ReturnType<typeof generateSchema>>
  >;
  savedId?: string; // Přidáno pro vrácení uloženého ID
  uploadError?: string; // Přidáno pro vrácení chyby
}> {
  console.log(formData,"formData");
  const id = formData.get("id") as string; // ID zaměstnance
  let savedId = "";
  const formId = formData.get("formId") as string;
  // Načtení struktury formuláře přímo v serverové akci
  const customFormStructure: MyFormData = await loadCustomFormStructure(formId);

  // Dynamicky generované schéma na základě customFormStructure
  const schema = generateSchema(customFormStructure);

  // Pomocné funkce pro parsing
  const parseInteger = (incomingValue: FormDataEntryValue | null): number => {
    const number = Number(incomingValue || 0);
    console.log("Number field incoming valur", incomingValue);
    console.log("Number field value to save", number);
    return isNaN(number) ? 0 : number;
  };

  const parseDate = (dateToParse: string): Date | null => {
    const date = new Date(dateToParse);
    return isNaN(date.getTime()) ? null : date;
  };

  // Dynamicky vytvoří objekt s daty z formData
  const personalDataUpdate: Record<string, any> = {};

  customFormStructure.elements.forEach((element) => {
    let value = formData.get(element.key); // Hodnotu získáme z FormData (z Web API)
    console.log(element.key, element.type, value);
    // Pokud je hodnota null, nastavíme ji na prázdný řetězec, aby validace proběhla správně
    if (value === null) {
      value = ""; // Výchozí hodnota pro všechna prázdná pole
    }

    // Zpracování hodnoty podle typu pole
    if (element.type === "number") {
      console.log("number find", element.key, value);

      personalDataUpdate[element.key] = parseInteger(value);
    } else if (element.type === "date") {
      personalDataUpdate[element.key] = value
        ? parseDate(value as string)
        : null;
    } else {
      personalDataUpdate[element.key] = value;
    }
  });

  // Validace pomocí dynamického schématu

  const validationResult = schema.safeParse(personalDataUpdate);

  if (!validationResult.success) {
    console.log("validace neprošla");
    const errors = validationResult.error.flatten().fieldErrors;
    return { errors };
  }

  // Aktualizace dat na serveru
  try { 
    // Získání záznamu z `PersonalInformations` na základě `employeeId`
    const response = await directus.request(
      readItems("PersonalInformations", {
        filter: {
          employeeId: id,
        },
        fields:  ["*", "employeeId.*"], // Načítáme pouze ID
      })
    );
  
    const existingPersonalInfoId = response?.[0]?.id; // Bezpečná kontrola
    let savedId;
  
    if (existingPersonalInfoId) {
      // Pokud záznam existuje, aktualizujeme ho
      console.log("Nalezen existující záznam, aktualizuji...");
      const result = await directus.request(
        updateItem("PersonalInformations", existingPersonalInfoId, personalDataUpdate)
      );
  
      if (result?.id) {
        savedId = result.id;
        console.log("PersonalInformations byl úspěšně aktualizován.");
      } else {
        console.log("Chyba při aktualizaci PersonalInformations.");
        return {
          errors: {
            uploadError: ["Data se nepodařilo uložit"],
          },
        };
      }
    } else {
      // Pokud záznam neexistuje, vytvoříme nový
      console.log("Záznam neexistuje, vytvářím nový...",id);
      const result = await directus.request(
        createItem("PersonalInformations", {
          employeeId: id,
          ...personalDataUpdate,
        })
      );
  
      if (result?.id) {
        savedId = result.id;
        console.log("Nový záznam v PersonalInformations byl vytvořen.");
      } else {
        console.log("Chyba při vytváření PersonalInformations.");
        return {
          errors: {
            uploadError: ["Data se nepodařilo uložit"],
          },
        };
      }
    }
    return  { errors: {}, savedId };; // Vrátíme `savedId` úspěšně uloženého záznamu
  } catch (error) {
    console.error("Data se nepodařilo uložit", error);
    return {
      errors: {
        uploadError: ["Data se nepodařilo uložit"],
      },
    };
  }
  

  return { errors: {}, savedId };
}
