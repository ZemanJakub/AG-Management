import { directus } from "@/app/lib/directus";
import { NotificationData } from "@/app/lib/models";
import { readItems } from "@directus/sdk";


export const fetchNotifcations = async (userId: string): Promise<NotificationData[]> => {
    try {
      const notifications = await directus.request(
        readItems("UserNotifications", {
          // filter: {
          //   userId: { _eq: userId },
          //   // status: { _eq: "active" },
          // },
        })
        
      ) as unknown as NotificationData[];
      return notifications;
    } catch (error) {
      console.error("Failed to get notifications:", error);
      return [];
    }
  };
  