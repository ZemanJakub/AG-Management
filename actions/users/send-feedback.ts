"use server";
import { directus } from "@/app/lib/directus";
import { createItem, readMe, updateMe, uploadFiles } from "@directus/sdk";

export async function sendFeedback(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean }> {
  try {
    const feedbackData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      feedback: formData.get("feedback") as string,
      evaluation: formData.get("evaluation") as string,
    };
    // Odeslání dat na server
    const response = await directus.request(
      createItem("Feedbacks", feedbackData)
    );
    if (response.id) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Chyba při zpracování formuláře:", error);
    return { success: false };
  }
}
