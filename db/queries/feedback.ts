import { directus } from "@/app/lib/directus";
import { readItems } from "@directus/sdk";

interface Feedback {
    id: string;
    name: string;
    image: string;
    category: string;
    votes: number;
  }
export const fetchFeedbackInformations = async (): Promise<Feedback[]> => {
    try {
      const response = await directus.request(readItems("campaign"));
      const finalResponse = response as unknown as Feedback[];
      return finalResponse
    } catch (error) {
      console.error("Error fetching form:", error);
      // Můžete vrátit vlastní strukturu chybové odpovědi nebo znovu vyvolat chybu
      throw new Error("Failed to fetch employee data.");
    }
  };
