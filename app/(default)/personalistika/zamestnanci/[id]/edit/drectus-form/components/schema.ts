import { z } from "zod";
import { MyFormData } from "./types";

export const generateSchema = (formData: MyFormData) => {
  const schemaObject: any = {};

  formData.elements.forEach((element) => {
    switch (element.type) {
      case "input":
        schemaObject[element.key] = element.required
          ? z.string().min(1, `Povinné pole`)
          : z.string().optional();
        break;

      case "textarea":
        schemaObject[element.key] = element.required
          ? z.string().min(1, `Povinné pole`)
          : z.string().min(1, `Povinné pole`)
        break;

      case "select":
        const allowedValues = element.choices ? element.choices.map((choice) => choice.value) : [];
        if (element.required && element.choices) {
          schemaObject[element.key] = z
            .preprocess((val) => (val === "" ? undefined : val), z.enum(allowedValues as [string, ...string[]]))
            .refine((val) => allowedValues.includes(val as string), {
              message: "Neplatná hodnota povinného pole",
            });
        } else {
          schemaObject[element.key] = z
            .union([z.enum(allowedValues as [string, ...string[]]), z.literal("NaN")])
            .optional()
            .refine((val) => val === "NaN" || allowedValues.includes(val as string), {
              message: "Neplatná hodnota volitelného pole",
            });
        }
        break;

        case "number":
          schemaObject[element.key] = element.required
              ? z.number().min(0, `${element.label} musí být kladné číslo`)
              : z.number().optional();
          break;
      
      case "date":
          schemaObject[element.key] = element.required
              ? z.instanceof(Date).nullable()
              : z.instanceof(Date).nullable().optional();
          break;

      case "address":
        schemaObject[element.key] = element.required
          ? z.string().min(1, `Povinné pole`)
          : z.string().optional();
        break;

      case "email":
        schemaObject[element.key] = element.required
          ? z.string().email(`${element.label} musí být platná emailová adresa`)
          : z.string().email().optional();
        break;

      default:
        break;
    }
  });

  return z.object(schemaObject);
};
