"use server";

import {  z } from "zod";
import { directus } from "@/app/lib/directus";
import {readMe, updateMe, uploadFiles } from "@directus/sdk";
import { UserData } from "@/app/lib/models";
import { DirectusUserToUpload } from "../auth/types";
import sharp from "sharp";

const IMAGE_WIDTH = 150;
const IMAGE_HEIGHT = 150;

// Helper pro validaci a zpracování FormData
const loginSchema = z.object({
  email: z.string().email({ message: "Chybná emailová adresa" }).trim(),
  password: z.string().min(4, { message: "Heslo musí obsahovat alespoň 4 znaky" }).trim(),
});

const extractFormData = (formData: FormData) => ({
  id: formData.get("id") as string | undefined,
  first_name: formData.get("first_name") as string | undefined,
  last_name: formData.get("last_name") as string | undefined,
  email: formData.get("newemail") as string | undefined,
  password: formData.get("newpassword") as string | undefined,
  title: formData.get("title") as string | undefined,
  description: formData.get("description") as string | null | undefined,
  avatar: formData.get("avatar") as string | null | undefined,
});

// Helper pro práci s obrázky
const processImage = async (dataUrl: string, resize = false): Promise<Blob | null> => {
  try {
    const uri = dataUrl.split(";base64,").pop();
    const imgBuffer = Buffer.from(uri || "", "base64");

    const finalBuffer = resize
      ? await sharp(imgBuffer).resize(IMAGE_WIDTH, IMAGE_HEIGHT).toBuffer()
      : imgBuffer;

    return new Blob([finalBuffer], { type: "image/jpeg" });
  } catch (error) {
    console.error("Chyba při zpracování obrázku:", error);
    return null;
  }
};

// Hlavní akce pro aktualizaci profilu
export async function updateProfile(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean }> {
  try {
    // Validace přihlašovacích údajů
    const credentials = {
      email: formData.get("email") as string | undefined,
      password: formData.get("oldpassword") as string | undefined,
    };
    const validation = loginSchema.safeParse(credentials);
    if (!validation.success || !credentials.email || !credentials.password) {
      return { success: false };
    }

    // Přihlášení uživatele
    await directus.login(credentials.email, credentials.password);

    // Získání aktuálních uživatelských dat
    const currentUserData = (await directus.request(
      readMe({
        fields: ["id", "first_name", "last_name", "email", "title", "description", "avatar"],
      })
    )) as UserData;

    // Příprava dat k aktualizaci
    const extractedData = extractFormData(formData);
    const userDataToUpdate: Partial<DirectusUserToUpload> = {};

    for (const key in extractedData) {
      const newValue = extractedData[key as keyof typeof extractedData];
      const currentValue = currentUserData[key as keyof UserData];

      if (newValue && newValue !== currentValue) {
        userDataToUpdate[key as keyof DirectusUserToUpload] = newValue;
      }
    }

    // Zpracování a nahrání nového avataru
    if (userDataToUpdate.avatar) {
      const photoFile = formData.get("avatar") as string;
      if (photoFile) {
        const processedAvatarPhotoBlob = await processImage(photoFile, true);
        if (processedAvatarPhotoBlob) {
          const newFileName = `${currentUserData.last_name} ${currentUserData.first_name}`;
          const avatarPhotoFile = new File([processedAvatarPhotoBlob], newFileName, {
            type: "image/jpeg",
          });

          const photoData = new FormData();
          photoData.append("title", newFileName);
          photoData.append("folder", "9fb0a031-3103-4527-adef-2831c9ac402d");
          photoData.append("file", avatarPhotoFile);

          const uploadResult = await directus.request(uploadFiles(photoData));
          if (uploadResult.id) {
            userDataToUpdate.avatar = uploadResult.id;
          }
        }
      }
    }

    // Aktualizace uživatelských dat
    const updateResult = await directus.request(updateMe(userDataToUpdate));
    return updateResult.id ? { success: true } : { success: false };
  } catch (error) {
    console.error("Failed to update user data:", error);
    return { success: false };
  }
}

