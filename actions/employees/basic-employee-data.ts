"use server";

import { z } from "zod";
import { directus } from "@/app/lib/directus";
import {
  createFolder,
  createItem,
  updateItem,
} from "@directus/sdk";
import { TransformToFieldErrorsType } from "@/components/utils/utils";
import { MyFormData } from "@/components/directus-form/components/types";
import { generateSchema } from "@/components/directus-form/components/schema";
import { fetchMyForm } from "@/db/queries/employees";

async function loadCustomFormStructure(): Promise<MyFormData> {
  const dynamicformData = await fetchMyForm(
    "9f192b09-f334-42e9-b609-78a358223231"
  );
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

export async function basicEmployeeData(
  prevState: any,
  formData: FormData // FormData z Web API
): Promise<{
  errors: TransformToFieldErrorsType<
    z.infer<ReturnType<typeof generateSchema>>
  >;
  savedId?: string; // Přidáno pro vrácení uloženého ID
  uploadError?: string; // Přidáno pro vrácení chyby
}> {
  let savedId: string | undefined;
  console.log("start updateBasicEmployeeDynamic");
  // Načtení struktury formuláře přímo v serverové akci
  const customFormStructure: MyFormData = await loadCustomFormStructure();

  // Dynamicky generované schéma na základě customFormStructure
  const schema = generateSchema(customFormStructure);

  // Pomocné funkce pro parsing
  const parseInteger = (incomingValue: FormDataEntryValue | null): number => {
    const number = Number(incomingValue || 0);
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

    if (value === null) {
      value = ""; // Výchozí hodnota pro všechna prázdná pole
    }

    if (element.type === "number") {
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
    const errors = validationResult.error.flatten().fieldErrors;
    console.log(errors, "validationResult");

    return { errors }; // Pokud validace selže, vrátíme pouze chyby
  }

  // Aktualizace dat na serveru
  try {
    const id = formData.get("id") as string;

    if (!id || id === undefined || id === "undefined") {
 
      const folderResult = await directus.request(
        createFolder({
          name: `${personalDataUpdate.firstName} ${personalDataUpdate.secondName}`,
          parent: "e18f708b-ca9c-4a8a-87c1-b2f264cbce61",
        })
      );
      console.log(folderResult, "folder result");

      const result = await directus.request(
        createItem("basicEmployeeData", {
          ...personalDataUpdate,
          folderId: folderResult.id,
        })
      );

      if (result.id) {
        console.log("novy zamestnanec ulozen", result.id);
        savedId = result.id;
        return { errors: {}, savedId };
      } else {
        return {
          errors: {
            uploadError: ["Data se nepodařilo uložit"],
          },
        };
      }
    }
    if (id) {
      const result = await directus.request(
        updateItem("basicEmployeeData", id, personalDataUpdate)
      );
      if (result.id) {
        console.log("novy zamestnanec upraven");
        savedId = result.id;
        return { errors: {}, savedId };
      } else {
        return {
          errors: {
            uploadError: ["Data se nepodařilo uložit"],
          },
        };
      }
    }
  } catch (error) {
    console.error("Data se nepodařilo uložit", error);
    return {
      errors: {
        uploadError: ["Data se nepodařilo uložit"],
      },
    };
  }

  // Pokud vše proběhne v pořádku, vrátíme chyby jako prázdné a uložené ID
  return { errors: {}, savedId };
}
