"use server";

import webpush from "web-push";
import { directus } from "@/app/lib/directus";
import { readItems } from "@directus/sdk";

// Ověření, že proměnné prostředí existují
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error("VAPID klíče nejsou definovány v proměnných prostředí.");
}

webpush.setVapidDetails(
  "mailto: <jakub.zeman84@gmail.com>",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function checkSubscription(endpoint: string) {
  try {
    const endpointVerification = await directus.request(
      readItems("swsubmit", {
        filter: {
          endpoint: {
            _eq: endpoint,
          },
        },
      })
    );

    if (process.env.NODE_ENV === "development") {
      console.log("Endpoint verification result:", endpointVerification);
    }

    if (Array.isArray(endpointVerification) && endpointVerification.length > 0) {
      return {
        success: true,
        subscription: {
          endpoint: endpointVerification[0].endpoint,
          keys: {
            p256dh: endpointVerification[0].p256dh,
            auth: endpointVerification[0].auth,
          },
        },
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error checking subscription", error);
    return { success: false, error: "Failed to check subscription" };
  }
}
