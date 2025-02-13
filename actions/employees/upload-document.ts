"use server";

import { directus } from "@/app/lib/directus";
import {
  createFolder,
  readFiles,
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
import { move } from "formik";

let myerror = "";

interface UpdateEmployeeFormState {
  errors: {
    document?: string[];
  };
}
interface UpdateFileInfoProps {
  id: string;
  firstName: string;
  secondName: string;
}

//update basic card start ********************************************************************************************************************
export async function uploadDocument(
  info: UpdateFileInfoProps,
  formState: UpdateEmployeeFormState,
  formData: FormData
): Promise<UpdateEmployeeFormState> {
  //get form data
  const documentFile = formData.getAll("file");

  const findFolder = async (id: string) => {
    const folderresult = await directus.request(
      readItem("employees", id, {
        fields: ["id", "folderId"],
      })
    );
    if (folderresult.folderId) {
      return folderresult.folderId;
    } else return null;
  };

  const filecheck = async (decodedString: string) => {
    const filecheck = await directus.request(
      readFiles({
        filter: {
          title: {
            _eq: decodedString,
          },
        },
      })
    );
    if (filecheck.length > 0) {
      return false;
    } else {
      return true;
    }
  };

  const folderId: string | null = await findFolder(info.id);

  if (!folderId) {
    return {
      errors: {
        document: ["Složka zaměstnance nebyla nalezena, soubor nelze nahrát."],
      },
    };
  }

  if (folderId) {
    const allfileResult = documentFile.map(async (singleFile) => {
      const file = singleFile as File; // Cast FormDataEntryValue to File type
      let fileData = new FormData();
      const decodedString = decodeURIComponent(escape(file.name));
      fileData.append("title", `${decodedString}`);
      fileData.append("folder", folderId);
      fileData.append("file", file);

      // check if file with same name exist
      const fileExist = await filecheck(decodedString);
      if (!fileExist) {
        return {
          errors: {
            document: [
              "Soubor s tímto názvem již existuje, změňte název souboru a zkuste to znovu.",
            ],
          },
        };
      }
      if (fileExist) {
        const uploadResult = await directus.request(uploadFiles(fileData));
        if (uploadResult) {
          return {
            errors: {},
          };
        } else {
          return {
            errors: {
              document: [
                "Soubor se nepodařilo nahrát, zkuste to prosím znovu.",
              ],
            },
          };
        }
      }
    });

    const result = await Promise.all(allfileResult);
    revalidatePath(paths.employeeHome());
    revalidatePath(paths.employeeDetailPath(info.id));
    revalidatePath(paths.editEmployeePath(info.id));

    if (result[0]?.errors) {
      return {
        errors: result[0].errors,
      };
    } else {
      return {
        errors: {},
      };
    }
  }

  return {
    errors: {},
  };
}
