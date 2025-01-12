
import { Websocket } from "@/components/employees/websocket";
import { directus } from "@/app/lib/directus";
import { readItems } from "@directus/sdk";


export default async function Socket() {
  // const data = await directus.request(readItems("messages"));
 
  // const messagesData = data as unknown as Mymessage[];

    return (
      <div>
         <Websocket />
      </div>
    )
  }

