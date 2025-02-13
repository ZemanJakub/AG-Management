"use server";

import webpush from "web-push";
import { directus } from "@/app/lib/directus";
import { readItems, deleteItem } from "@directus/sdk";

// Ověření proměnných prostředí pro bezpečnost
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error("VAPID klíče nejsou definovány v proměnných prostředí.");
}

webpush.setVapidDetails(
  "mailto: <jakub.zeman84@gmail.com>",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function unsubscribeUser(endpoint: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Načtení všech odpovídajících záznamů
    const result = await directus.request(
      readItems("swsubmit", {
        filter: { endpoint: { _eq: endpoint } },
      })
    );

    if (!Array.isArray(result) || result.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("Žádné záznamy k odstranění.");
      }
      return { success: true, message: "Žádné záznamy k odstranění." };
    }

    // Paralelní mazání záznamů
    const deletePromises = result.map(async (item) => {
      if (!item.id) {
        console.error(`❌ Item ID is undefined for endpoint ${item.endpoint}`);
        return { success: false, error: `Item ID is undefined for endpoint ${item.endpoint}` };
      }
      try {
        await directus.request(deleteItem("swsubmit", item.id));
        return { success: true };
      } catch (error) {
        console.error(`❌ Chyba při odstraňování záznamu s endpointem ${item.endpoint}:`, error);
        return { success: false, error: `Chyba při odstraňování ${item.endpoint}` };
      }
    });

    const results = await Promise.allSettled(deletePromises);

    const failedDeletes = results.filter(res => res.status === "rejected");
    if (failedDeletes.length > 0) {
      return {
        success: false,
        error: `Některé subscription se nepodařilo odstranit: ${failedDeletes.length}`,
      };
    }

    return {
      success: true,
      message: "Všechny odpovídající subscription byly odstraněny.",
    };
  } catch (error) {
    console.error("❌ Chyba při odstraňování subscription:", error);
    return { success: false, error: "Failed to delete subscription" };
  }
}
