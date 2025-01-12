"use server";

import { z } from "zod";
import { directus } from "@/app/lib/directus";
import { updateItem, readItems } from "@directus/sdk";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import paths from "@/components/employees/paths";
import { TransformToFieldErrorsType } from "@/components/utils/utils";

  // schema for validation --- start
  const personalEmployeeSchema = z.object({
    dateOfEmployment: z
      .date({
        required_error: "Povinný údaj",
        invalid_type_error: "Povinný údaj",
      })
      .nullable(),
    recruitment: z
      .string()
      .refine(
        (value) =>
          /NaN|Není vyžadováno|Inzertní weby|Firemní web|Facebook|Jiné sociální sítě|Tištěná inzerce|Doporučení zaměstnance|Jiné osobní doporučení|Ostatní/.test(
            value
          ),
        {
          message: "Zadaná hodnota není platná.",
        }
      ),
    practice: z
      .string()
      .refine(
        (value) =>
          /NaN|Není vyžadováno|Ne|0 až 1 rok|1 až 2 roky|2 až 5 roků|5 let a více/.test(
            value
          ),
        {
          message: "Zadaná hodnota není platná.",
        }
      ),
    execution: z
      .string()
      .refine(
        (value) => /NaN|Není vyžadováno|Ne|Ano a řeší|Ano a neřeší/.test(value),
        {
          message: "Zadaná hodnota není platná.",
        }
      ),
    valueOfExecution: z
      .string()
      .refine(
        (value) => /NaN|neví|do 100k|do 500k|do 1M|více než 1M|0/.test(value),
        {
          message: "Zadaná hodnota není platná.",
        }
      ),
    otherDPP: z.string().refine((value) => /NaN|Ne|Ano/.test(value), {
      message: "Zadaná hodnota není platná.",
    }),
    otherDPPValue: z
      .string()
      .refine(
        (value) =>
          /NaN|do 7.500,-Kč|0|do 10.500,-Kč|do 17.500,-Kč|více než 17.500,-Kč/.test(
            value
          ),
        {
          message: "Zadaná hodnota není platná.",
        }
      ),
    shifts: z
      .string()
      .refine((value) => /NaN|Denní|Vše|Noční|Není vyžadováno/.test(value), {
        message: "Zadaná hodnota není platná.",
      }),
    shiftsValue: z.number(),
    healthStatus: z
      .string()
      .refine(
        (value) =>
          /NaN|Dobrý|Omezení nočních směn|Omezení pochůzek|Jiná omezení|Není vyžadováno/.test(
            value
          ),
        {
          message: "Zadaná hodnota není platná.",
        }
      ),
    smoker: z
      .string()
      .refine((value) => /NaN|Ano|Ne|Občasný|Není vyžadováno/.test(value), {
        message: "Zadaná hodnota není platná.",
      }),
    comment: z.string(),
    uploadError: z.string().optional(),
  });

 export type PersonalEmployee = z.infer<typeof personalEmployeeSchema>;
  // schema for validation --- end

//update basic card start ********************************************************************************************************************
export async function updatePersonalEmployee(
  prevState:any,
  formData: FormData
): Promise<TransformToFieldErrorsType<PersonalEmployee>> {
  let saved = "NaN";
  // schema for validation --- start
  

  // init error status for form end
  //parse strings to integer - shiftsValue
  const parseInteger = (incomingNumber: number | null | string): number => {
    let currentNumber = 0;
    if (incomingNumber !== null && incomingNumber !== undefined) {
      currentNumber = parseInt(incomingNumber.toString());
    }
    return currentNumber;
  };
  // parse date to corerct format
  const parseDate = (datetoparse: string, field: string): Date | null => {
    const dateParts = datetoparse.split(",");
    // Příklad použití
    let currentDate = null;
    try {
      function monthNameToNumber(monthName: string): number {
        // Převod názvu měsíce na malá písmena pro case-insensitive porovnání.
        let lowerCaseMonth = monthName.toLowerCase();
        // Pomocí switch převedeme název měsíce na jeho číslo.
        switch (lowerCaseMonth) {
          case "led":
            return 0;
          case "ún":
            return 1;
          case "bře":
            return 2;
          case "dub":
            return 3;
          case "kvě":
            return 4;
          case "čer":
            return 5;
          case "čvc":
            return 6;
          case "srp":
            return 7;
          case "zář":
            return 8;
          case "říj":
            return 9;
          case "lis":
            return 10;
          case "pro":
            return 11;
          default:
            throw new Error("Neznámý název měsíce.");
        }
      }
      const cisloMesice: number = monthNameToNumber(
        dateParts[1].toString().replace(/\s/g, "")
      );
      currentDate = new Date(
        Number(dateParts[2].replace(/\s/g, "")),
        cisloMesice,
        Number(dateParts[0].replace(/\s/g, ""))
      );
      // Adding one day because of timezone
      currentDate.setDate(currentDate.getDate() + 1);
      return currentDate;
    } catch (error) {
      console.log("Nesprávný formát data");
      return null;
    }
  };



  // get id from form
  const id = formData.get("id") as string;
  // get data from input
  const personalDataUpdate = {
    dateOfEmployment:
      formData.get("dateOfEmployment") === ""
        ? null
        : parseDate(
            formData.get("dateOfEmployment") as string,
            "dateOfEmployment"
          ),
    recruitment: formData.get("recruitment"),
    practice: formData.get("practice"),
    execution: formData.get("execution"),
    valueOfExecution: formData.get("valueOfExecution"),
    otherDPP: formData.get("otherDPP"),
    otherDPPValue: formData.get("otherDPPValue"),
    shifts: formData.get("shifts"),
    shiftsValue: parseInteger(formData.get("shiftsValue") as string),
    healthStatus: formData.get("healthStatus"),
    smoker: formData.get("smoker"),
    comment: formData.get("comment"),
  };
  // data validation start

  const validationresult = personalEmployeeSchema.safeParse(personalDataUpdate);
  if (!validationresult.success) {
   const errors = validationresult.error.flatten().fieldErrors;
   return errors as TransformToFieldErrorsType<PersonalEmployee>;
  }

  // data validation on server end

  // data update on server start

  try {
    const result = await directus.request(
      updateItem("PersonalInformations", id, personalDataUpdate)
    );
    revalidatePath(paths.employeeHome());
    revalidatePath(paths.employeeDetailPath(result.employeeID));
    revalidatePath(paths.editEmployeePath(result.employeeID));
    if (result.id) {
      console.log(`personal update ok.`);
      saved = paths.employeeDetailPath(result.employeeID);
    }
  } catch (error: any) {
    console.error(`Data se nepodařilo uložit`, error);
    
    // Vytvoříme chybu ve formátu očekávaném formulářem
    return {
      uploadError: ["Data se nepodařilo uložit"],
    } as TransformToFieldErrorsType<PersonalEmployee>;
  }
  // data update on server end
  redirect(saved);
}
