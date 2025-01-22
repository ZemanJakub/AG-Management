"use server";

import { z } from "zod";
import { directus } from "@/app/lib/directus";
import { createItem, readItems, updateItem } from "@directus/sdk";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import paths from "@/components/employees/paths";
import { TransformToFieldErrorsType } from "@/components/utils/utils";
import { generateSchema } from "@/app/(default)/personalistika/zamestnanci/[id]/edit/drectus-form/components/schema";
import { MyFormData } from "@/app/(default)/personalistika/zamestnanci/[id]/edit/drectus-form/components/types";
import { fetchMyForm } from "@/db/queries/employees";

// export async function updateBasicEmployeeDynamic(
//   prevState: any,
//   formData: FormData // FormData z Web API
// ): Promise<
//   TransformToFieldErrorsType<z.infer<ReturnType<typeof generateSchema>>>

// > {
//   let saved = "NaN";

//   // Načtení struktury formuláře přímo v serverové akci
//   const customFormStructure: MyFormData = await loadCustomFormStructure();

//   // Dynamicky generované schéma na základě customFormStructure
//   const schema = generateSchema(customFormStructure);

//   // Pomocné funkce pro parsing
//   const parseInteger = (incomingValue: FormDataEntryValue | null): number => {
//     const number = Number(incomingValue || 0);
//     return isNaN(number) ? 0 : number;
//   };

//   const parseDate = (dateToParse: string): Date | null => {
//     const date = new Date(dateToParse);
//     return isNaN(date.getTime()) ? null : date;
//   };

//   // Dynamicky vytvoří objekt s daty z formData
//   const personalDataUpdate: Record<string, any> = {};

//   customFormStructure.elements.forEach((element) => {
//     let value = formData.get(element.key); // Hodnotu získáme z FormData (z Web API)

//     // Pokud je hodnota null, nastavíme ji na prázdný řetězec, aby validace proběhla správně
//     if (value === null) {
//       value = ""; // Výchozí hodnota pro všechna prázdná pole
//     }

//     // Zpracování hodnoty podle typu pole
//     if (element.type === "number") {
//       personalDataUpdate[element.key] = parseInteger(value);
//     } else if (element.type === "date") {
//       personalDataUpdate[element.key] = value
//         ? parseDate(value as string)
//         : null;
//     } else {
//       personalDataUpdate[element.key] = value;
//     }
//   });

//   // Validace pomocí dynamického schématu
//   const validationResult = schema.safeParse(personalDataUpdate);

//   if (!validationResult.success) {
//     console.log("validace neprošla");
//     const errors = validationResult.error.flatten().fieldErrors;
//     return errors as TransformToFieldErrorsType<z.infer<typeof schema>>;
//   }

//   // Aktualizace dat na serveru
//   try {
//     const id = formData.get("id") as string;
//     console.log(personalDataUpdate);
//     const result = await directus.request(
//       createItem("basicEmployeeData", personalDataUpdate)
//     );
  
//     console.log(result);
 
//   } catch (error) {
//     console.error("Data se nepodařilo uložit", error);
//     return {
//       uploadError: ["Data se nepodařilo uložit"],
//     } as TransformToFieldErrorsType<z.infer<typeof schema>>;
//   }

//   redirect(saved);
// }

// Funkce, která načte strukturu formuláře a převede ji do požadovaného formátu
async function loadCustomFormStructure(): Promise<MyFormData> {
  const dynamicformData = await fetchMyForm(
    "0c149237-74b8-4a4c-b741-f473d13b2d4b"
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

export async function updateBasicEmployeeDynamic(
  prevState: any,
  formData: FormData // FormData z Web API
): Promise<{
  errors: TransformToFieldErrorsType<z.infer<ReturnType<typeof generateSchema>>>;
  savedId?: string; // Přidáno pro vrácení uloženého ID
}> {
  let savedId: string | undefined;

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
    return { errors }; // Pokud validace selže, vrátíme pouze chyby
  }

  // Aktualizace dat na serveru
  try {
    const id = formData.get("id") as string;
    
    const result = await directus.request(
      createItem("basicEmployeeData", personalDataUpdate)
    );

    // Předpokládáme, že `result` obsahuje ID uloženého záznamu
    savedId = result.id;
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
