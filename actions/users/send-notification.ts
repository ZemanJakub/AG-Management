"use server";

import webpush from "web-push";
import { directus } from "@/app/lib/directus";
import { readItems, createItems } from "@directus/sdk";

// Ověření, že proměnné prostředí jsou správně nastavené
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error("VAPID klíče nejsou definovány v proměnných prostředí.");
}
if (!process.env.NEXT_PUBLIC_AGSPACE_URL) {
  throw new Error("NEXT_PUBLIC_AGSPACE_URL není definováno.");
}

webpush.setVapidDetails(
  "mailto: <jakub.zeman84@gmail.com>",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendNotification(
  message: string = "Nová zpráva",
  title: string = "AGSPACE",
  url: string = ""
) {
  const appUrl = `${process.env.NEXT_PUBLIC_AGSPACE_URL}${url}`;
  if (!/^https?:\/\//.test(appUrl)) {
    throw new Error("Invalid URL for notification");
  }

  // Simulace seznamu uživatelů, kteří mají dostat notifikaci
  const users = ["f2d6f416-429d-42b5-95ec-c35732dc4a9a", "86546ccc-1ef8-4deb-96f7-fa18cb9b3459"];

  // Uložení notifikací do databáze
  const databaseNotificationsArray = users.map((userId) => ({
    status: "active",
    userId,
    title,
    message,
    url: appUrl,
  }));

  try {
    const saveDatabaseNotifications = await directus.request(
      createItems("UserNotifications", databaseNotificationsArray)
    );

    if (!saveDatabaseNotifications) {
      throw new Error("Failed to save database notifications");
    }

    console.log("✅ Database notifications saved successfully");
  } catch (error) {
    console.error("❌ Error saving database notifications:", error);
    return { success: false, error: "Failed to save database notifications" };
  }

  // Načtení všech uživatelských subscriptions
  let usersSubscriptions;
  try {
    usersSubscriptions = await directus.request(
      readItems("swsubmit", {
        filter: { userId: { _in: users } },
      })
    );

    if (!usersSubscriptions || !Array.isArray(usersSubscriptions)) {
      throw new Error("Failed to fetch subscriptions");
    }
  } catch (error) {
    console.error("❌ Error fetching subscriptions:", error);
    return { success: false, error: "Failed to fetch subscriptions" };
  }

  // Vytvoření seznamu subscription objektů
  const subscriptions = usersSubscriptions.map((eachUser) => ({
    endpoint: eachUser.endpoint,
    keys: {
      p256dh: eachUser.p256dh,
      auth: eachUser.auth,
    },
  }));

  // Sestavení push notifikace
  const payload = JSON.stringify({
    title,
    body: message,
    icon: "/icons/icon-96x96.png",
    vibrate: [100, 50, 200],
    actions: [{ action: "openUrl", title: "Otevřít stránku" }],
    data: { openUrl: appUrl },
  });

  // Odeslání push notifikací
  try {
    const notificationResults = await Promise.allSettled(
      subscriptions.map((subToSend) => webpush.sendNotification(subToSend, payload))
    );

    const failedNotifications = notificationResults.filter(res => res.status === "rejected");

    if (failedNotifications.length > 0) {
      console.warn(`⚠️ Některé notifikace se nepodařilo odeslat: ${failedNotifications.length}`);
      return { success: false, error: `Some notifications failed (${failedNotifications.length})` };
    }

    console.log("✅ All push notifications sent successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending push notifications:", error);
    return { success: false, error: "Failed to send push notifications" };
  }
}
