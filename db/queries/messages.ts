import {
  EmployeePersonalInformations,
  HolderInformations,
  InterviewInformations,
} from "@/app/lib/models";
import { directus } from "@/app/lib/directus";
import { readItem, readItems } from "@directus/sdk";
import { cache } from "react";

interface Mymessage {
  date_created: string;
  id: number;
  text: string;
  user: string;
}


export const fetchMessageData = async ():Promise<Mymessage[]> => {
    let result: any;
    let messageData : Mymessage[] = [];
    try {
      result = await directus.request(
        readItems("Messages")
      );
      

    messageData = result as unknown as Mymessage[];
    console.log(messageData)
    } catch (e) {
      console.log("messages not found");
    }

    return messageData;
  }


