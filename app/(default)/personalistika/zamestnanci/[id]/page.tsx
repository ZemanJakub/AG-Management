// app/employees/[id]/page.tsx

export const metadata = {
  title: "Profil zaměstnance",
  description: "Personal profile of employee",
};

import { directus } from "@/app/lib/directus";
import { readItems } from "@directus/sdk";
import PageHeader from "@/components/employees/page-header";
import ProfileTabs from "@/components/employees/profile-tabs";
import BasicContent from "@/app/(default)/personalistika/zamestnanci/[id]/basic-content";
import PersonalContent from "@/components/employees/personal-content";
import { Suspense } from "react";
import PageHeaderLoading from "@/components/employees/page-header-loading";
import BasicContentLoading from "@/components/employees/basic-content-loading";
import ContractContent from "@/components/employees/contract-content";
import DocumentContent from "@/components/employees/documents/document-content";
import { fetchBasicEmployeeData } from "@/db/queries/employees";
import { cookies } from "next/headers";

interface SnippetShowPageProps {
  params: {
    id: string;
  };
  searchParams: { name: string };
}

export default async function EmployeeDetail({ params, searchParams }: SnippetShowPageProps) {
  const userPermission = (await cookies()).get("userPermission")?.value;
  // console.log("opravneni uzivatele na strance", userPermission);
  const { id } = await params;
  const par = await searchParams
  const namep = par.name;
  const isEditable = false;

  const employeeData = await fetchBasicEmployeeData(id);

  return (
    <>
      <Suspense fallback={<PageHeaderLoading />}>
        {employeeData && <PageHeader employeeData={employeeData} id={id} perrmission={userPermission ? userPermission : ""} />}
      </Suspense>

      <ProfileTabs id={id} namep={namep} />
      {namep === undefined && (
        <Suspense fallback={<BasicContentLoading />}>
         {employeeData && <BasicContent employeeData={employeeData} id={id} perrmission={userPermission?userPermission:""}/>}
       </Suspense>
      )}
      {employeeData&&namep === "Personalistika" && <PersonalContent id={id} employeeData={employeeData} perrmission={userPermission?userPermission:""}/>}
      {namep === "Dokumenty" && <DocumentContent id={id} isEditable={isEditable} />}
      {namep === "Výstroj" && <ContractContent id={id} />}
      {namep === "Školení" && <div>Školení</div>}
      {namep === "Evidence docházky" && <div>Evidence docházky</div>}
      {namep === "Mzdy" && <div>Mzdy</div>}
    </>
  );
}

export async function generateStaticParams() {
  const employees = await directus.request(readItems("employees"));

  return employees.map((employee) => ({
    id: employee.id,
  }));
}
