"use server";

import { z } from "zod";
import { createSession } from "app/lib/session";

import { directus } from "@/app/lib/directus";
import {
  AuthenticationData,
  readMe,
} from "@directus/sdk";
import { DataForSession, UserData } from "@/app/lib/models";

const loginSchema = z.object({
  email: z.string().email({ message: "Chybná emailová adresa" }).trim(),
  password: z
    .string()
    .min(4, { message: "Heslo musí obsahovat alespoň 4 znaky" })
    .trim(),
});
export async function login(prevState: any, formData: FormData) {
  try {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { email, password } = result.data;
    const authData: AuthenticationData = await directus.login(email, password);

    const userData = (await directus.request(
      readMe({
        fields: ["id", "first_name", "last_name", "email", "avatar"],
      })
    )) as unknown as UserData;

    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    const dataforsession: DataForSession = {
      ...authData,
      ...userData,
      expiresAt: expiresAt,
    };
    await createSession(dataforsession);

    return { success: true };
  } catch (error) {
    console.error("Chyba při přihlašování:", error);
    return { errors: { general: ["Chyba při přihlašování. Zkuste to znovu."] } };
  }
}

