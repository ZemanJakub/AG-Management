import {
  readItems,
  createItems,
  createItem,
  readUsers,
  readUser,
  deleteItems,
  deleteItem,
  updateItem,
  readRelationByCollection,
  readRelation,
} from "@directus/sdk";
import { directus } from "./directus";

export async function createSampleProcess() {
  console.log("Starting create process");
  try {
    // 1. Vytvoření procesu
    const newProcess = {
      name: "Schválení dokumentu",
      description: "Proces zahrnuje vyplnění formuláře a schválení adminem.",
      deadline: "2024-12-31T23:59:59.000Z",
    };

    const processResponse = await directus.request(
      createItem("Processes", newProcess)
    );
    const processId = processResponse.id;

    console.log("Process created:");

    // 2. Přidání uživatelů do rolí

    const userResponse = await directus.request(
      readUsers({
        filter: { email: { _eq: "basic@user.com" } },
        fields: ["id"],
      })
    );
    const adminResponse = await directus.request(
      readUsers({
        filter: { email: { _eq: "test@gmail.com"} },
        fields: ["id"],
      })
    );

    if (!userResponse.length || !adminResponse.length) {
      throw new Error("User or Admin not found!");
    }

    const userId = userResponse[0].id;
    const adminId = adminResponse[0].id;
    console.log(userId, adminId, "user and admin id");

    await createRolesWithProcessUpdate(processId, userId, adminId);
      deleteProcess(processId);
    // // 3. Přidání kroků procesu
    // const steps = [
    //   {
    //     process_id: processId,
    //     step_name: 'Vyplnění formuláře',
    //     assigned_role: 'User',
    //     deadline: '2024-12-15T23:59:59.000Z',
    //     status: 'pending',
    //   },
    //   {
    //     process_id: processId,
    //     step_name: 'Schválení adminem',
    //     assigned_role: 'Admin',
    //     deadline: '2024-12-20T23:59:59.000Z',
    //     status: 'pending',
    //   },
    // ];

    // await directus.request(createItems('process_steps', steps));
    // console.log('Steps created.');

    // console.log('Sample process with steps and roles created successfully!');
  } catch (error) {
    console.error("Error creating sample process:", error);
  }
}

async function deleteProcess(processId: string) {
  try {
    // Odstranění procesu
    console.log("processId to delete", processId);
    await directus.request(deleteItem("Processes", processId));
    console.log(
      `Process ${processId} and its related records deleted successfully!`
    );
  } catch (error) {
    console.error("Error deleting process:", error);
  }
}

async function createRolesWithProcessUpdate(
  processId: string,
  userId: string,
  adminId: string
) {
  try {
    // Aktualizace procesu s přidáním rolí
     const processRoles = [
        {
          process_id:processId, // Správný formát pro relaci
          userId: userId,
          role: 'User',
        },
        {
          process_id:processId, // Správný formát pro relaci
          userId: adminId,
          role: 'Admin',
        },
      ];

    
    const roles = await directus.request(createItems('process_roles', processRoles));
    console.log('Roles assigned.',roles);


  } catch (error) {
    console.error("Error creating roles with process update:", error);
  }
}
