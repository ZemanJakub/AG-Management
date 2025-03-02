
import { createDirectus, rest, authentication } from '@directus/sdk';

export const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus.aglikace.cz')
  .with(authentication("cookie", {credentials: "include", autoRefresh: true}))
  .with(rest());




// const client = createDirectus('http://directus.aglikace.cz').with(authentication());;
// await client.login("jakub.zeman84@gmail.com", "t5eVEu97JpQ8pRl");
// ktTE0XSsarFXHfUqsuFt8JvhM0rMnzDE

// import {
//   createDirectus,
//   staticToken,
//   rest,
//   readItems,
//   createCollection,
//   readCollections,
//   login,
//   createItem,
//   realtime,
// } from "@directus/sdk";
// import { Employee } from "./models";

// export const directus = createDirectus("https://directus.aglikace.cz/")
//   .with(staticToken("ktTE0XSsarFXHfUqsuFt8JvhM0rMnzDE"))
//   .with(rest());

//   export const directus = createDirectus("https://directus.aglikace.cz/")
//   .with(staticToken("ktTE0XSsarFXHfUqsuFt8JvhM0rMnzDE"))
//   .with(rest({onRequest: (options) => ({ ...options, cache: 'no-store' })}));


//   export const directusClient = createDirectus("wss://directus.aglikace.cz/websocket").with(staticToken("ktTE0XSsarFXHfUqsuFt8JvhM0rMnzDE")).with(realtime());


// interface Props {
//   newEmployee: Employee;
// }




// export const saveEmployee = async (Employee:Props) => {
//   try {
//     directus
//       .request(
//         createItem("employees",Employee)
//       )
//       .then((response) => console.log("item created",response)) 
//       .catch((error) => console.error("fuck",error));
//   } catch (error) {
//     console.error("Error fetching data from Directus:", error);
//   }

    // try {
    //     const response = await directus.request(readCollections());
    //     console.log("response", response);
    // } catch (error) {
    //     console.error("Error fetching data from Directus:", error);
    // }
//   try {
//     directus
//       .request(
//         createCollection({
//           collection: "test",
//           schema: {
//             name: "string",
//             age: "number",
//             email: "string",
//           },
//         })
//       )
//       .then((response) => console.log("odpoveeeeeeeeeeeeeeeeeeeeed",response))
//       .catch((error) => console.error("qqqqqqqqqqqqqqqqqqqqqqqqqqq",error));
//   } catch (error) {
//     console.error("Error fetching data from Directus:", error);
//   }

//   try {
//     directus
//       .request(
//         createItem("test",{
         
//             name: "huhu",
//             age: "111",
//             email: "kuk@seznam.cz",
          
//         })
//       )
//       .then((response) => console.log("item created",response))
//       .catch((error) => console.error("fuck",error));
//   } catch (error) {
//     console.error("Error fetching data from Directus:", error);
//   }



