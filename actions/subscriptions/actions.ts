"use server";

import webpush from "web-push";
import { DataForSession, SubscriptionToSave } from "@/app/lib/models";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { directus } from "@/app/lib/directus";
import { createItem, readItems, deleteItem, createItems } from "@directus/sdk";

webpush.setVapidDetails(
  "mailto: <jakub.zeman84@gmail.com>",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);
let subscription: webpush.PushSubscription | null = null;
export async function subscribeUser(sub: webpush.PushSubscription) {
  subscription = sub;

  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const userData = session?.payload as unknown as DataForSession;
  console.log(userData,"userData")
  if (session && userData.id) {
    try {
      const newSubscription = {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userId: userData.id,
        // date: new Date(),
      };

      const result = await directus.request(
        createItem("swsubmit", newSubscription)
      );
      if (result.id) {
        console.log("Subscription saved successfully");
      }
    } catch (error) {
      console.error("Error saving subscription", error);
      return { success: false, error: "Failed to save subscription" };
    }
  }

  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}
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
    console.log(endpointVerification)
    if (endpointVerification.length > 0) {
      const databaseeSubscription: webpush.PushSubscription = {
        endpoint: endpointVerification[0].endpoint,
        keys: {
          p256dh: endpointVerification[0].p256dh,
          auth: endpointVerification[0].auth,
        },
      };
      subscription = databaseeSubscription;
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error saving subscription", error);
    return { success: false, error: "Failed to save subscription" };
  }
}
export async function unsubscribeUser(endpoint: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Načtení všech záznamů odpovídajících endpointu
    const result = (await directus.request(
      readItems("swsubmit", {
        filter: { endpoint: { _eq: endpoint } },
      })
    )) as SubscriptionToSave[];

    if (result.length > 0) {
      // Paralelní mazání záznamů
      const deletePromises = result.map(async (item) => {
        try {
          if (item.id) {
            await directus.request(deleteItem("swsubmit", item.id));
            console.log(`Záznam se subscription byl odstraněn.`);
          } else {
            console.error(`Item ID is undefined for endpoint ${item.endpoint}`);
          }
        } catch (error) {
          console.error(
            `Chyba při odstraňování záznamu s endpointem ${item.endpoint}:`,
            error
          );
        }
      });

      await Promise.all(deletePromises); // Čeká na dokončení všech mazání
      return {
        success: true,
        message: "Všechny odpovídající subscription byly odstraněny.",
      };
    } else {
      console.log("Žádné záznamy k odstranění.");
      return { success: true, message: "Žádné záznamy k odstranění." };
    }
  } catch (error) {
    console.error("Chyba při odstraňování subscription:", error);
    return { success: false, error: "Failed to delete subscription" };
  }
}
export async function sendNotification(
  message: string = "Nová zpráva",
  title: string = "AGSPACE",
  url: string = ""
) {
  if (!subscription || !subscription.endpoint) {
    throw new Error("No valid subscription available");
  }

  const appUrl = `${process.env.NEXT_PUBLIC_AGSPACE_URL}${url}`;
  if (!appUrl.startsWith("http")) {
    throw new Error("Invalid URL for notification");
  }

  // kod pro definici uzivatelu kteri maji dostat databazovou notifikaci vracet by mel pole s id uzivatelu

  //mock objekt uzivatelu
  const users = ["f2d6f416-429d-42b5-95ec-c35732dc4a9a","86546ccc-1ef8-4deb-96f7-fa18cb9b3459"];

  // ulozeni notifikaci do databaze
  const databaseNotificationsArray = users.map((userId) => ({
    status: "active",
    userId,
    title,
    message,
    url: appUrl,
  }));
  
  const saveDatabaseNotifications = await directus.request(
    createItems("UserNotifications", databaseNotificationsArray)
  );
  if (saveDatabaseNotifications) {
    console.log("Database notifications saved successfully");
  } else {
    console.error("Error saving database notification");
    return { success: false, error: "Failed to save database notification" };
  }

  // stazeni vsech subscription uzivatelu, kterym maji odejit push notifikace, na zaklade id uzivatele se lze podivat do tabulky users a zjistit jejich subscription

  const usersSubscriptions = await directus.request(
    readItems("swsubmit", {
      filter: {
        userId: {
          _in: users,
        },
      },
    })
  );
  if (!usersSubscriptions) {
    console.error("Error fetching subscriptions");
    return { success: false, error: "Failed to fetch subscriptions" };
  }
  // vytvoreni pole subscription pro odeslani notifikace
  const subscriptions = usersSubscriptions.map((eachuser) => ({
    endpoint: eachuser.endpoint,
    keys: {
      p256dh: eachuser.p256dh,
      auth: eachuser.auth,
    },
  }));
  // tvorba push notifikace
  const payload = JSON.stringify({
    title,
    body: message,
    icon: "/icons/icon-96x96.png",
    vibrate: [100, 50, 200],
    actions: [
      {
        action: "openUrl",
        title: "Otevřít stránku",
      },
    ],
    data: {
      openUrl: appUrl,
    },
  });

  // odeslani notifikace
  try {
    await Promise.all(
      subscriptions.map((subToSend) =>
        webpush.sendNotification(subToSend, payload)
      )
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send push notifications" };
  }
}
