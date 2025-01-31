import {
  DocumentProps,
  EmployeePersonalInformations,
  EmployeeToDisplay,
  HolderInformations,
  InterviewInformations,
} from "@/app/lib/models";
import { directus } from "@/app/lib/directus";
import {
  deleteFile,
  deleteFiles,
  deleteItem,
  deleteItems,
  readFiles,
  readFolder,
  readItem,
  readItems,
} from "@directus/sdk";
import { cache } from "react";
import { Management } from "@/app/(default)/staff/new-employee/types";

export const fetchMyForm = async (id: string) => {
  try {
    console.log("form start");
    // Předpokládáme, že `directus.request` vrací Promise, takže přidáváme `await`
    const response = await directus.request(
      readItems("forms", {
        filter: {
          id: {
            _eq: id,
          },
        },
        fields: ["*", "elements.*"],
      })
    );
    return response;
  } catch (error) {
    console.error("Error fetching form:", error);
    // Můžete vrátit vlastní strukturu chybové odpovědi nebo znovu vyvolat chybu
    throw new Error("Failed to fetch form data.");
  }
};
export const fetchEmployeeBasicInformations = async (id: string) => {
  try {
    console.log("form start");
    // Předpokládáme, že `directus.request` vrací Promise, takže přidáváme `await`
    const response = await directus.request(readItem("basicEmployeeData", id));
    return response;
  } catch (error) {
    console.error("Error fetching employee informations:", error);
    // Můžete vrátit vlastní strukturu chybové odpovědi nebo znovu vyvolat chybu
    throw new Error("Failed to fetch employee data.");
  }
};

export const fetchEmployeePersonalInformations = async (id: string) => {
  try {
    const response = await directus.request(
      readItems("PersonalInformations", {
        filter: {
          employeeId: id, // Pole, které odkazuje na `basicEmployeeData`
        },
      })
    );
    return response[0];
  } catch (error) {
    console.error("Error fetching form:", error);
    // Můžete vrátit vlastní strukturu chybové odpovědi nebo znovu vyvolat chybu
    throw new Error("Failed to fetch employee data.");
  }
};
export const fetchNewEmployeeFormBasicInformations = async (
  id: string
): Promise<string | undefined> => {
  try {
    const result = await directus.request(readItem("Texts", id));
    const newEmployeeFormBasicInformations = result.text as unknown as string;
    return newEmployeeFormBasicInformations;
  } catch (e) {
    console.log("Texts not found");
    return undefined;
  }
};

export const fetchManagement = async () => {
  try {
    const response = await directus.request(readItems("Management"));
    return response as unknown as Management[];
  } catch (error) {
    console.error("Error fetching management:", error);
    throw new Error("Failed to fetch management data.");
  }
};

export const fetchBasicEmployeeData = cache(
  async (id: string): Promise<EmployeeToDisplay | undefined> => {
    try {
      const result = await directus.request(readItem("employees", id));

      const employeeData = result as EmployeeToDisplay;
      return employeeData;
    } catch (e) {
      console.log("Employee not found");
      return undefined;
    }
  }
);

export const fetchPersonalEmployeeData = cache(
  async (id: string): Promise<InterviewInformations> => {
    let result: any;
    let employeePersonalData: InterviewInformations = {
      id: "",
      employeeID: "",
      otherDPP: "",
      otherDPPValue: "",
      shifts: "",
      shiftsValue: 0,
      healthStatus: "",
      smoker: "",
      practice: "",
      execution: "",
      valueOfExecution: "",
      dateOfEmployment: null,
      recruitment: "",
      comment: "",
    };
    try {
      result = await directus.request(
        readItems("PersonalInformations", {
          filter: {
            employeeID: {
              _eq: id,
            },
          },
        })
      );

      employeePersonalData = result[0] as unknown as InterviewInformations;
    } catch (e) {
      console.log("employee not found");
    }

    return employeePersonalData;
  }
);

export const fetchHolderData = cache(
  async (id: string): Promise<HolderInformations> => {
    let result: any;
    let holderData: HolderInformations = {
      id: "",
      employeeID: "",
      kalhoty: "",
      triko: "",
      softschell: "",
      zimnibunda: "",
      mikina: "",
      boty: "",
    };
    try {
      result = await directus.request(
        readItems("HolderInforamtions", {
          filter: {
            employeeID: {
              _eq: id,
            },
          },
        })
      );

      holderData = result[0] as unknown as HolderInformations;
    } catch (e) {
      console.log("employee not found");
    }

    return holderData;
  }
);

export const deleteDocuments = async (id: string): Promise<any> => {
  try {
    const documentResult = await directus.request(
      readItems("Documents", {
        filter: {
          documentId: {
            _eq: id,
          },
        },
        fields: ["id"],
      })
    );
    console.log(documentResult[0].id, "document to delete");

    await directus.request(deleteItem("Documents", documentResult[0].id));
  } catch (e) {
    console.log("Document details not found");
  } finally {
    try {
      const fileResult = await directus.request(deleteFile(id));
      return fileResult;
    } catch (e) {
      console.log("File not found");
    }
  }
};

export const fetchDocumentData = cache(
  async (id: string): Promise<DocumentProps[]> => {
    let documentsResult = [] as DocumentProps[];
    try {
      const result = await directus.request(
        readFiles({
          filter: {
            folder: {
              _eq: id,
            },
          },
        })
      );
      if (result.length > 0) {
        for (const item of result) {
          const singleDocumentResult = await directus.request(
            readItems("Documents", {
              filter: {
                documentId: {
                  _eq: item.id,
                },
              },
            })
          );
          if (singleDocumentResult[0]) {
            const singleDocument =
              singleDocumentResult[0] as unknown as DocumentProps;
            const parsedSingleDocument = {
              ...singleDocument,
              id: item.id,
              url: `https://directus.aglikace.cz/assets/${item.id}`,
            } as DocumentProps;

            documentsResult.push(parsedSingleDocument);
          } else {
            const singleDocument: DocumentProps = {
              id: item.id,
              folderId: id,
              name: item.title,
              type: item.type,
              status: "draft",
              url: `https://directus.aglikace.cz/assets/${item.id}`,
              date_created: item.uploaded_on,
              documentId: item.id,
            };
            documentsResult.push(singleDocument);
          }
        }
      }
    } catch (e) {
      console.log("folder not found");
    }
    return documentsResult;
  }
);
