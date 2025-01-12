"use server";

import { z } from "zod";
import { createSession, deleteSession } from "app/lib/session";

import { redirect } from "next/navigation";
import { directus } from "@/app/lib/directus";
import {
  AuthenticationData,
  readFile,
  readItems,
  readMe,
  updateItem,
  updateMe,
  updateUser,
  uploadFiles,
} from "@directus/sdk";
import { DataForSession, UserData } from "@/app/lib/models";
import { DirectusUser, DirectusUserToUpload } from "./types";
import sharp from "sharp";

const IMAGE_WIDTH = 150;
const IMAGE_HEIGHT = 150;
const IMAGE_FORMAT = "jpeg";

const processAndResizeImage = async (dataUrl: string): Promise<Blob | null> => {
  try {
    const uri = dataUrl.split(";base64,").pop();
    const imgBuffer = Buffer.from(uri ? uri : "", "base64");
    const resizedImageBuffer = await sharp(imgBuffer)
      .resize(IMAGE_WIDTH, IMAGE_HEIGHT)
      .toBuffer();
    const blob = new Blob([resizedImageBuffer], { type: "image/jpeg" });
    return blob;
  } catch (error) {
    console.error("Chyba při zpracování obrázku:", error);
    return null;
  }
};
const processImage = async (dataUrl: string): Promise<Blob | null> => {
  try {
    const uri = dataUrl.split(";base64,").pop();
    const imgBuffer = Buffer.from(uri ? uri : "", "base64");
    const blob = new Blob([imgBuffer], { type: "image/jpeg" });
    return blob;
  } catch (error) {
    console.error("Chyba při zpracování obrázku:", error);
    return null;
  }
};

const loginSchema = z.object({
  email: z.string().email({ message: "Chybná emailová adresa" }).trim(),
  password: z
    .string()
    .min(4, { message: "Heslo musí obsahovat alespoň 4 znaky" })
    .trim(),
});

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  const authData: AuthenticationData = await directus.login(email, password);
  // console.log("login",authData)
  const userData = (await directus.request(
    readMe({
      fields: ["id", "first_name", "last_name", "email", "avatar"],
    })
  )) as unknown as UserData;
  // console.log("login",userData)
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // týden
  const dataforsession: DataForSession = {
    ...authData,
    ...userData,
    expiresAt: expiresAt,
  };
  await createSession(dataforsession);

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/signin");
}
