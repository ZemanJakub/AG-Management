"use server";

import webpush from "web-push";
import { DataForSession } from "@/app/lib/models";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { directus } from "@/app/lib/directus";
import { createItem, readItems } from "@directus/sdk";

// Ověření existence VAPID klíčů
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error("VAPID klíče nejsou definovány v proměnných prostředí.");
}

webpush.setVapidDetails(
  "mailto: <jakub.zeman84@gmail.com>",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(sub: webpush.PushSubscription) {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const userData = session?.payload as unknown as DataForSession;

  if (!session || !userData?.id) {
    return { success: false, error: "Unauthorized or missing user data" };
  }

  try {
    // Ověříme, zda už subscription existuje
    const existingSubscriptions = await directus.request(
      readItems("swsubmit", {
        filter: { endpoint: { _eq: sub.endpoint } },
      })
    );

    if (Array.isArray(existingSubscriptions) && existingSubscriptions.length > 0) {
      return { success: true, message: "Subscription already exists" };
    }

    // Vytvoříme novou subscription
    const newSubscription = {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userId: userData.id,
    };

    const result = await directus.request(createItem("swsubmit", newSubscription));

    if (result?.id) {
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Subscription saved successfully:", result);
      }
      return { success: true };
    } else {
      throw new Error("Subscription creation failed");
    }
  } catch (error) {
    console.error("❌ Error saving subscription:", error);
    return { success: false, error: "Failed to save subscription" };
  }
}
