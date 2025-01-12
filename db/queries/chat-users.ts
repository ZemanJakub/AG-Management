import {
    ChatUser,
  } from "@/app/lib/models";
  import { directus } from "@/app/lib/directus";
  import { readItems } from "@directus/sdk";
  import { cache } from "react";
  
  export const fetchChatUserData = cache(
    async (): Promise<ChatUser[]> => {
      let chatUsersData: ChatUser[] = [];
      try {
       const result = await directus.request(
          readItems("employees", {
            fields: [
              "id",
              "firstName",
              "secondName",
              "distinction",
              "photo",
            ],
            filter: {
              status: "published",
            },
          })
        );
        chatUsersData = result as unknown as ChatUser[];
      } catch (e) {
        console.log("employee not found");
      }
  
      return chatUsersData;
    }
  );