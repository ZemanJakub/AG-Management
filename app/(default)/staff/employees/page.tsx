export const metadata = {
  title: "Přehled zaměstnanců",
  description: "Zobrazení přehledu zaměstnanců v přijímacím proesu",
};

import { directus } from "@/app/lib/directus";
import { readItems } from "@directus/sdk";
import HrTable from "./hrtable";
import { MyFormData } from "@/components/directus-form/components/types";
import { fetchMyForm } from "@/queries/employees";
import DataComponent from "./data-component";

const formId = "9f192b09-f334-42e9-b609-78a358223231";
export default async function Recruitment() {
  const result = await directus.request(readItems("basicEmployeeData"));
  const formStructure = await fetchMyForm(formId);

  return (
    <>
      <DataComponent employeeInitData={result} formStructure={formStructure} />
    </>
  );
}
