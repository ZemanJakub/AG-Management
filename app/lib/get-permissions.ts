import { readPermissions } from "@directus/sdk";
import { directus } from "./directus";

export const fetchPermissions = async (collection: string) => {
     const permissions = await directus.request(readPermissions({
         collection: 'directus_permissions',
         filter: {
           collection: {
             _eq: collection,
           },
         },
         fields: ['action'], // nebo specifická pole jako ['role', 'action', 'fields']
       }));
     return permissions;
   }
