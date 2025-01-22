// import { fetchMyForm } from "@/db/queries/employees";
// import DynamicFormComponent from "./dynamic-form";
// import { MyFormData } from "./components/types";

// export default async function TestForm() {

//     const formData = await fetchMyForm("d0dc63e9-f8a7-457f-a17f-6583869b449b");

//     return (
//         <div>
//             <DynamicFormComponent formData={formData[0] as unknown as MyFormData}id={"123"} />
//         </div>
//     )
// }


"use client";

import { useEffect, useState } from "react";
import { fetchMyForm } from "@/db/queries/employees";
import DynamicFormComponent from "./dynamic-form";
import { MyFormData } from "./components/types";

export default function TestForm() {
  const [formData, setFormData] = useState<MyFormData | null>(null);

  useEffect(() => {
    // Načtení dat při montování komponenty
    fetchMyForm("d0dc63e9-f8a7-457f-a17f-6583869b449b").then((data) => {
      setFormData(data[0] as unknown as MyFormData);
    });
  }, []);

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <DynamicFormComponent formData={formData} id={"123"} />
    </div>
  );
}