export { internalRedirect } from "./internal-redirect";
export { createEmployee } from "./emloyees/datahandle/create-employee";
export { updateEmployeeData } from "./emloyees/datahandle/update-employee-data";
export {uploadPhoto} from "./emloyees/photos/upload-photo"
export {updatePersonalEmployee} from "./emloyees/datahandle/update-personal-employee"
export {uploadDocument} from "./emloyees/files/upload-document"
export {updatePersonalEmployeeDynamic} from "./emloyees/datahandle/update-preferences-personal-dynamic"
export {updateBasicEmployeeDynamic} from "./emloyees/datahandle/update-basic-employee-dynamic"
export {subscribeUser, unsubscribeUser, sendNotification, checkSubscription} from "./subscriptions/actions"
export {updateProfile} from "./users/actions"
export {sendFeedback} from "./feedback/actions"
export {updateNewEmployeeFeedback} from "./emloyees/datahandle/update-new-employee-feedback"


// fetch personal data **************************************************************************************************************************************************
// export async function fetchPersonalData(id:string) {

//   const personalData = await directus.request(
//     readItems("employees", {
//       fields: [
//         "id",
//           "firstName",
//           "secondName",
//           "distinction",
//           "photo",
//           "dateOfBirth",
//           "dateOfEmployment",
//           "comment",
//           "adress",
//           "email",
//           "phone",
//           "acount",
//           "state",
//           "pid",
//           "insurance",
//           "criminalRecord",
//           "healtCheck",
//           "certificate",
//       ],
//       filter: {id:id}
//     })
//   );
//   const employeeData = personalData[0] as unknown as EmployeePersonalInformations;
//   return employeeData;
// }




// vzor volání server actions from client možnost1 - funguje i bez javascriptu**************************************************************************************************************************************************
// import {startTransition} from "react";

// const handleClick = () => {
//   startTransition(async()=>{
//     await internalRedirect("page");
//   }) 
// }
// return <button onClick={handleClick}>Click me</button>

// vzor volání server actions from client možnost2 **************************************************************************************************************************************************
// import {editEmploee} from "actions";


// const [obsah, setObsah] = useState("")

//const editEmployeeAction = editEmploee.bind(null,code)


// return <form action={editEmployeeAction}>
//<button type="submit">Submit</button>
//</form>

// v actions to pak vypada takto 
//export async function editEmployee (obsah,FormData){
//}


