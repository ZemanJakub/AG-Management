"use server";

import { directus } from "@/app/lib/directus";
import { updateItem } from "@directus/sdk";

interface Feedback {
  id: string;
  name: string;
  image: string;
  category: string;
  votes: number;
}

export async function updateNewEmployeeFeedback(
  state: any, // State, který useActionState očekává
  payload: { id: string; feedback: Feedback } // ID a data
): Promise<{ error?: string; success?: boolean }> {
  const { id, feedback } = payload;

  try {
    console.log("start saving feedback", feedback);

    const result = await directus.request(
      updateItem("campaign", feedback.id, {
        votes: +feedback.votes + 1,
      })
    );

    console.log("feedback saved", result);
    return { success: true };
  } catch (error) {
    console.error("Error updating campaign:", error);
    return { success: false, error: "Failed to update campaign." };
  }
}
