import { z } from "zod";
import { directus } from "@/app/lib/directus";
import { createFolder, createItem, uploadFiles } from "@directus/sdk";
import { Employee } from "@/app/lib/models";
import { redirect } from "next/navigation";
import paths from "@/components/employees/paths";
import { TransformToFieldErrorsType } from "@/components/utils/utils";


// Schéma pro validaci
const employeeSchema = z.object({
  firstName: z.string().refine((data) => data.trim() !== "", {
    message: "Povinný údaj",
  }),
  secondName: z.string().refine((data) => data.trim() !== "", {
    message: "Povinný údaj",
  }),
  distinction: z.string(),
  email: z.string().email().nullable(),
  dateOfBirth: z.date({
    required_error: "Povinný údaj",
    invalid_type_error: "Povinný údaj",
  }),
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
    adress: z
    .string()
    .nullable() // Umožňuje, aby adresa byla null
    .refine((value) => value === null || value === "" || value === "NaN" || /[a-zA-Z0-9-/]/.test(value), {
      message: "Zadaná hodnota není platná.",
    }),
  state: z
    .string()
    .refine((value) => /Není vyžadováno|CZ|SK|EU|Mimo EU/.test(value), {
      message:
        'Zadaná hodnota není platná. Povolené hodnoty jsou "C", "SK", "EU", "Mimo EU", nebo "Není vyžadováno"',
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
  criminalRecord: z.date().nullable(),
  healtCheck: z.date().nullable(),
  certificate: z
    .string()
    .refine((value) => /Ano|NaN|Diplom|Není vyžadováno/.test(value), {
      message: "Zadaná hodnota není platná.",
    }),
  photo: z.string(),
  kalhoty: z
    .string()
    .refine((value) => /NaN|L|XL|XXL|XXXL|XXXXL|M/.test(value), {
      message: "Zadaná hodnota není platná.",
    }),
  triko: z
    .string()
    .refine((value) => /NaN|L|XL|XXL|XXXL|XXXXL|M/.test(value), {
      message: "Zadaná hodnota není platná.",
    }),
  softschell: z
    .string()
    .refine((value) => /NaN|L|XL|XXL|XXXL|XXXXL|M/.test(value), {
      message: "Zadaná hodnota není platná.",
    }),
  zimnibunda: z
    .string()
    .refine((value) => /NaN|L|XL|XXL|XXXL|XXXXL|M/.test(value), {
      message: "Zadaná hodnota není platná.",
    }),
  mikina: z
    .string()
    .refine((value) => /NaN|L|XL|XXL|XXXL|XXXXL|M/.test(value), {
      message: "Zadaná hodnota není platná.",
    }),
  boty: z
    .string()
    .refine((value) => /^(3[6-9]|[4-9][0-9]|47)$|NaN|/.test(value), {
      message: "Zadaná hodnota není platná.",
    }),
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
});

function parseDate(dateString: string, field: string): Date | null {
  const dateParts = dateString.split(",");
  try {
    const monthNameToNumber = (monthName: string): number => {
      const lowerCaseMonth = monthName.toLowerCase();
      switch (lowerCaseMonth) {
        case "led": return 0;
        case "ún": return 1;
        case "bře": return 2;
        case "dub": return 3;
        case "kvě": return 4;
        case "čer": return 5;
        case "čvc": return 6;
        case "srp": return 7;
        case "zář": return 8;
        case "říj": return 9;
        case "lis": return 10;
        case "pro": return 11;
        default: throw new Error("Neznámý název měsíce.");
      }
    };
    const cisloMesice = monthNameToNumber(dateParts[1].trim());
    const parsedDate = new Date(
      Number(dateParts[2].trim()),
      cisloMesice,
      Number(dateParts[0].trim())
    );
    parsedDate.setDate(parsedDate.getDate() + 1); // Přidání jednoho dne pro časové pásmo
    return parsedDate;
  } catch (error) {
    console.error(`Nesprávný formát data pro ${field}:`, error);
    return null;
  }
}

function parseInteger(value: string | null | undefined): number {
  return value ? parseInt(value) : 0;
}

export async function createEmployee(
  prevState: any,
  formData: FormData
): Promise<TransformToFieldErrorsType<Employee> | void> {
  let saved = "NaN";
  let myerror = {};

  const photoID = "31fae310-6ebe-47d2-84a0-260e03a30c37"; // Nastavení výchozího ID pro fotografii
  const newEmployee = {
    firstName: formData.get("firstName"),
    secondName: formData.get("secondName"),
    distinction: formData.get("distinction"),
    email: (formData.get("email") as string) === "NaN" ? null : formData.get("email"),
    dateOfBirth: formData.get("dateOfBirth") === "" ? null : parseDate(formData.get("dateOfBirth") as string, "dateOfBirth"),
    dateOfEmployment: formData.get("dateOfEmployment") === "" ? null : parseDate(formData.get("dateOfEmployment") as string, "dateOfEmployment"),
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
    kalhoty: formData.get("kalhoty"),
    triko: formData.get("triko"),
    softschell: formData.get("softschell"),
    zimnibunda: formData.get("zimnibunda"),
    mikina: formData.get("mikina"),
    boty: formData.get("boty"),
    photo: photoID,
    phone: formData.get("phone"),
    acount: formData.get("acount"),
    adress: formData.get("adress"),
    state: formData.get("state"),
    pid: formData.get("pid"),
    insurance: formData.get("insurance"),
    criminalRecord: formData.get("criminalRecord") === "" ? null : parseDate(formData.get("criminalRecord") as string, "criminalRecord"),
    healtCheck: formData.get("healtCheck") === "" ? null : parseDate(formData.get("healtCheck") as string, "healtCheck"),
    certificate: formData.get("certificate"),
    comment: formData.get("comment"),
    folderId: "",
  };

  const validation = employeeSchema.safeParse(newEmployee);
   if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return errors as TransformToFieldErrorsType<Employee>;
  }

  const uniqueKey = `${(newEmployee.distinction as string)?.toLowerCase()}${(newEmployee.firstName as string).toLowerCase()}${(newEmployee.secondName as string).toLowerCase()}`;
  const uniqueEmployee = { ...newEmployee, uniquekey: uniqueKey };

  // const photoFile = formData.get("photo") as File;
  // if (photoFile) {
  //   const photoData = new FormData();
  //   photoData.append("file", photoFile, `${uniqueEmployee.firstName}_${uniqueEmployee.secondName}`);
  //   try {
  //     const uploadResult = await directus.request(uploadFiles(photoData));
  //     uniqueEmployee.photo = uploadResult.id;
  //   } catch (error) {
  //     myerror = { ...myerror, photo: "Fotografii se nepodařilo nahrát" };
  //     console.error("Error uploading photo:", error);
  //   }
  // }

  try {
    
    const folderResult = await directus.request(
      createFolder({
        name: `${uniqueEmployee.secondName} ${uniqueEmployee.firstName}`,
        parent: "e18f708b-ca9c-4a8a-87c1-b2f264cbce61",
      })
    );
   uniqueEmployee.folderId = folderResult.id;

    const result = await directus.request(createItem("employees", uniqueEmployee));
     if (result.id) {
      saved = paths.employeeDetailPath(result.id);
    }
  } catch (error) {
    console.error("Error creating employee or folder:", error);
    return {
      uploadError: ["Data se nepodařilo uložit."],
    } as TransformToFieldErrorsType<Employee>;
  }

  if (saved !== "NaN") {
    redirect(saved);
  } else {
    return;
  }
}
