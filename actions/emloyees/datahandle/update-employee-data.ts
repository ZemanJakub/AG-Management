"use server";

import { z } from "zod";
import { directus } from "@/app/lib/directus";
import { updateItem, readItems } from "@directus/sdk";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import paths from "@/components/employees/paths";
import { TransformToFieldErrorsType } from "@/components/utils/utils";

const basicEmployeeSchema = z.object({
  firstName: z.string().refine((data) => data.trim() !== "", {
    message: "Povinný údaj",
  }),
  secondName: z.string().refine((data) => data.trim() !== "", {
    message: "Povinný údaj",
  }),
  distinction: z.string().refine((data) => data.trim() !== "", {
    message: "Povinný údaj",
  }),
  dateOfBirth: z.date({
    required_error: "Povinný údaj",
    invalid_type_error: "Povinný údaj",
  }),
  pid: z
    .string()
    .refine((value) => /[a-zA-Z0-9-/]|Není vyžadováno/.test(value), {
      message: "Zadaná hodnota není platná.",
    }),
  insurance: z
    .string()
    .refine(
      (value) =>
        /RBP|ZPMV|ZPŠ|OZP|ČPZP|VOZP|VZP|NaN|Není vyžadováno/.test(value),
      {
        message: "Zadaná hodnota není platná.",
      }
    ),
  state: z
    .string()
    .refine((value) => /NaN|Není vyžadováno|CZ|SK|EU|Mimo EU/.test(value), {
      message:
        'Zadaná hodnota není platná. Povolené hodnoty jsou "C", "SK", "EU", "Mimo EU", "NaN" nebo "Není vyžadováno"',
    }),
    uploadError: z.string().optional(),
    email: z.string().email().nullable(),
    phone: z
      .string()
      .refine((value) => /^[0-9+]*$|NaN|Není vyžadováno/.test(value), {
        message:
          'Telefonní číslo musí být ve formátu "+420000000000", nebo "000000000", nebo "NaN" nebo "Není vyžadováno"',
      })
      .refine((data) => data.trim() !== "", {
        message: "Povinný údaj",
      }),
    acount: z
      .string()
      .refine((value) => /[0-9-]+[/]+[0-9]|NaN|Není vyžadováno/.test(value), {
        message:
          'Číslo účtu musí být ve formátu "0000-000/0000" nebo "NaN" nebo "Není vyžadováno"',
      }),
    adress: z.string().refine((data) => data.trim() !== "", {
      message: "Zadaná hodnota není platná.",
    }),
      criminalRecord: z.date().nullable(),
      healtCheck: z.date().nullable(),
      certificate: z
        .string()
        .refine((value) => /Ano|NaN|Diplom|Není vyžadováno/.test(value), {
          message: "Zadaná hodnota není platná.",
        }),
});
export type BasicEmployee = z.infer<typeof basicEmployeeSchema>;
//update basic card start ********************************************************************************************************************
export async function updateEmployeeData(
  prevState: any,
  formData: FormData
): Promise<TransformToFieldErrorsType<BasicEmployee>> {
  let saved = "NaN";
  // init error status for form start

  // init error status for form end

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
  const basicDataUpdate = {
    firstName: formData.get("firstName") as string,
    secondName: formData.get("secondName") as string,
    pid: formData.get("pid") as string,
    state: formData.get("state") as string,
    insurance: formData.get("insurance") as string,
    distinction:
      (formData.get("distinction") as string) === ""
        ? "NaN"
        : (formData.get("distinction") as string),
    dateOfBirth:
      formData.get("dateOfBirth") === ""
        ? null
        : parseDate(formData.get("dateOfBirth") as string, "dateOfBirth"),
        email:
        (formData.get("email") as string) === "NaN"
          ? null
          : (formData.get("email") as string),
      phone: formData.get("phone"),
      acount: formData.get("acount"),
      adress: formData.get("adress"),
      criminalRecord:
      formData.get("criminalRecord") === ""
        ? null
        : parseDate(formData.get("criminalRecord") as string, "criminalRecord"),
    healtCheck:
      formData.get("healtCheck") === ""
        ? null
        : parseDate(formData.get("healtCheck") as string, "healtCheck"),
    certificate: formData.get("certificate"),     

  };
  // data validation start

  const validationresult = basicEmployeeSchema.safeParse(basicDataUpdate);

  if (!validationresult.success) {
    const errors = validationresult.error.flatten().fieldErrors;
    return errors as TransformToFieldErrorsType<BasicEmployee>;
  }

  // create unique key start
  const newKey =
    basicDataUpdate.distinction.toLowerCase() +
    basicDataUpdate.firstName.toLowerCase() +
    basicDataUpdate.secondName.toLowerCase();
  // create unique key end

  // data validation on server start

  try {
    const validationrequest = await directus.request(
      readItems("employees", {
        fields: ["id"],
        filter: { uniquekey: newKey },
      })
    );
    console.log("readitemsFetch");
    interface ObjectWithId {
      id: string;
    }
    function compareId(seznam: ObjectWithId[], hledaneId: string): boolean {
      return seznam.every((objekt) => objekt.id === hledaneId);
    }
    const compare = compareId(
      validationrequest as unknown as ObjectWithId[],
      id
    );
    if (!compare) {
      return {
        firstName: ["Zaměstnanec s tímto jménem a příjmením již existuje."],
        secondName: ["Zaměstnanec s tímto jménem a příjmením již existuje."],
        distinction: ["Zadejte jiné rozlišení"],
      } as TransformToFieldErrorsType<BasicEmployee>;
    }
  } catch (error: any) {
    console.log(`Chyba v ověření, nepodařilo se provest na serveru`);
    return {
      uploadError: ["Data se nepodařilo uložit"],
    } as TransformToFieldErrorsType<BasicEmployee>;
  }
  // data validation on server end

  // data update on server start

  try {
    const result = await directus.request(
      updateItem("employees", id, basicDataUpdate)
    );
    revalidatePath(paths.employeeHome());
    revalidatePath(paths.employeeDetailPath(result.id));
    revalidatePath(paths.editEmployeePath(result.id));

    if (result.id) {
      console.log(`${result.firstName} ${result.secondName} - update ok.`);
      saved = paths.employeeDetailPath(result.id);
    }
  } catch (error: any) {
    console.log(`Data se nepodařilo uložit`);
    console.log(error);
    return {
      uploadError: ["Data se nepodařilo uložit"],
    } as TransformToFieldErrorsType<BasicEmployee>;
  }
  // data update on server end
  redirect(saved);
}
