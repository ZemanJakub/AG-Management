"use server";

import { directus } from "@/app/lib/directus";
import {
  readItem,
  updateItem,
  uploadFiles,
} from "@directus/sdk";
import sharp from "sharp";

const IMAGE_WIDTH = 150;
const IMAGE_HEIGHT = 150;
const processImage = async (
  dataUrl: string,
  resize = false
): Promise<Blob | null> => {
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

interface UpdatePhotoInfoProps {
  id: string;
  firstName: string;
  secondName: string;
}
export async function uploadPhoto(
  prevState: { success: boolean,errors:string },
  formData: FormData
): Promise<{ success: boolean,errors:string }> {
  console.log("Starting photo upload");

  try {
    const firstName = formData.get("firstName") as string | null;
    const secondName = formData.get("secondName") as string | null;
    const id = formData.get("id") as string | null;
    const photoFile = formData.get("photo") as string;
    const defaultPhotoId = `699729d7-e5fb-48e8-930c-6510fc06eb03`

    if (!firstName || !secondName || !id) {
      console.error("Missing required data for photo upload");
      return { success: false,errors:"Missing required data for photo upload" };
    }
    if (!photoFile) {
      console.error("Missing required data for photo upload");
      return { success: true,errors:"" };
    }

    const folderresult = await directus.request(
      readItem("basicEmployeeData", id, {
        fields: ["id", "folderId"],
      })
    );
    if (!folderresult?.folderId) {
      console.error("No folder ID found for the employee");
      return { success: false,errors:"No folder ID found for the employee" };
    }

    if (photoFile) {
      const processedAvatarPhotoBlob = await processImage(photoFile, true);
      if (processedAvatarPhotoBlob) {
        const newFileName = `${secondName} ${firstName}`;
        const avatarPhotoFile = new File(
          [processedAvatarPhotoBlob],
          newFileName,
          {
            type: "image/jpeg",
          }
        );

        const photoData = new FormData();
        photoData.append("title", newFileName);
        photoData.append("folder", folderresult.folderId);
        photoData.append("file", avatarPhotoFile);

        const uploadResult = await directus.request(uploadFiles(photoData));
        if (!uploadResult.id) {
          console.error("Photo upload failed");
          return { success: false,errors:"Photo upload failed" };
        }

        if (uploadResult.id) {
          console.log("Photo uploaded successfully:", uploadResult);
          const updateEmployeephoto = await directus.request(
            updateItem("basicEmployeeData", id, {
              photo: uploadResult.id,
            })
          );
          
          if (!updateEmployeephoto) {
            console.error("Photo update failed");
            return { success: false,errors:"Photo update failed" };
          } else {
            console.log("Photo updated successfully");
            return { success: true,errors:"" };
          }
        }
      }
    }

    return { success: true,errors:"" };
  } catch (error) {
    console.error("Error during photo upload:", error);
    return { success: false,errors:"Error during photo upload" };
  }
}
