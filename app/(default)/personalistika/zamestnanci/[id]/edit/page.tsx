export const metadata = {
  title: "Úprava profilu",
  description: "Personal profile of employee",
};

import { notFound } from "next/navigation";
import {
  fetchBasicEmployeeData,
} from "@/db/queries/employees";
import ProfileTabs from "@/components/employees/profile-tabs";
import UpdateBasicDataCard from "@/components/employees/update-basic-data-card";
import PageHeaderEdit from "@/components/employees/page-header-edit";
import { Suspense } from "react";
import PageHeaderLoading from "@/components/employees/page-header-loading";
import UpdateBasicDataCardLoading from "@/components/employees/update-basic-data-card-loading";
import UpdatePersonalDataCard from "@/components/employees/update-personal-data-card";
import DocumentContent from "@/components/employees/documents/document-content";
import TestForm from "./drectus-form/test-form";

interface SnippetShowPageProps {
  params: {
    id: string;
  };
  searchParams: { name: string };
}

export default async function EmployeeDetailEdit(props: SnippetShowPageProps) {
  const params = await props.params; // Čekání na params
  const id = params.id;                // Poté získat id
  const searchParams = await props.searchParams; // Čekání na searchParams
  const namep = searchParams.name;     // Poté získat name synchronně

  const employeeData = await fetchBasicEmployeeData(id);
  const isEditable = true;

  if (!employeeData) {
    return notFound();
  }

  return (
    <>
      <Suspense fallback={<PageHeaderLoading />}>
        <PageHeaderEdit id={id} employeeData={employeeData} />
      </Suspense>

      <ProfileTabs id={id} edit namep={namep} />
      {namep === undefined && (
        <Suspense fallback={<UpdateBasicDataCardLoading />}>
          <UpdateBasicDataCard employeeData={employeeData} id={id} />
        </Suspense>
      )}
      {namep === "Personalistika" && (
        <Suspense fallback={<UpdateBasicDataCardLoading />}>
          <UpdatePersonalDataCard personalData={employeeData} />
        </Suspense>
      )}
      {namep === "Dokumenty" && <DocumentContent id={id} isEditable={isEditable} />}
      {namep === "Výstroj" && <div>Výstroj</div>}
      {namep === "Školení" && <TestForm/>}
      {namep === "Evidence docházky" && <div>Evidence docházky</div>}
      {namep === "Mzdy" && <div>Mzdy</div>}
    </>
  );
}
