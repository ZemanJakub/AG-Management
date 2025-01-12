"use server";

import { directus } from "@/app/lib/directus";
import {
  createFolder,
  readFolder,
  readFolders,
  readItem,
  readItems,
  updateFile,
  updateFolder,
  updateItem,
  uploadFiles,
} from "@directus/sdk";
import { revalidatePath } from "next/cache";
import paths from "@/components/employees/paths";


interface UpdateEmployeeFormState {
  errors: {
    uploadError?: string[];
    allerror?: string[];
    photo?: string[];
  };
}
interface UpdatePhotoInfoProps {
  id: string;
  firstName: string;
  secondName: string;
}

//update basic card start ********************************************************************************************************************
export async function uploadPhoto(
  info: UpdatePhotoInfoProps,
  formState: UpdateEmployeeFormState,
  formData: FormData
): Promise<UpdateEmployeeFormState> {
  let saved = "NaN";

  // photo validation start
  let photoID: string = "";
  // const dataph = formData.get("photo");
  const photoFile = formData.get("photo");
  if (photoFile) {
    try {
      // fetch folder id
      const folderresult = await directus.request(
        readItem("employees", info.id, {
          fields: ["id", "folderId"],
        })
      );

      if (folderresult) {
        let photoData = new FormData();
        const firstName = info.firstName;
        const secondName = info.secondName;
        const newFileName = `${secondName} ${firstName}`;
        const decodedString = decodeURIComponent(escape(newFileName));
        photoData.append("title", decodedString);
        photoData.append("folder", folderresult.folderId); 
        photoData.append(decodedString, photoFile);

        const result = await directus.request(uploadFiles(photoData));

        if (
          typeof result.id === "string" &&
          result.filename_download !== "undefined"
        ) {
          photoID = result.id;
          revalidatePath(paths.employeeHome());
          revalidatePath(paths.employeeDetailPath(result.id));
          revalidatePath(paths.editEmployeePath(result.id));
        }
      }
    } catch (error) {
      return {
        errors: {
          photo: ["Fotografii se nepodařilo nahrát."],
        },
      };
    }
  }
  return {
    errors: {},
  };
}
