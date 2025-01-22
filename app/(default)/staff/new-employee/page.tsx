
import React from "react";
import PageComponent from "./page-component";
import { fetchManagement, fetchNewEmployeeFormBasicInformations } from "@/db/queries/employees";
import { Management } from "./types";


export default async function NewEmployee() {
  const ewEmployeeFormBasicInformationsId = "8587f258-19ff-4c50-8eba-ca06113c359b";
  const newEmployeeFormDataAgreementId = "d9072d21-cadf-4f2b-b774-16dd44401eec"
  const newEmployeeFormDataAgreementHeadingId = "4e5d83d0-01c2-4343-9d4a-b2925f0e8600"
  const newEmployeePersonalTeamHeadingId = "fb547f83-9c51-45a9-87c4-e72bba7e47ad"
  const newEmployeePersonalTeamFooterId = "660a49ea-6517-41bb-9961-e7957b252aa6"
  const newEmployeePersonalTeamMainHeadingId = "7364ce9b-1431-4717-966f-552d65ca4a70"
  const newEmployeeFormPersonalInformationsHeadingId = "38c2ff64-8599-4095-8810-ba8c685ace28"
const newEmployeeFormPreferencesHeadingId = "3e5a965c-7251-40fb-a05d-316410d0268d"
  

  const newEmployeeFormPreferencesHeading = await fetchNewEmployeeFormBasicInformations(newEmployeeFormPreferencesHeadingId);
  const newEmployeePersonalTeamHeading = await fetchNewEmployeeFormBasicInformations(newEmployeePersonalTeamHeadingId);
  const newEmployeeFormBasicInformations = await fetchNewEmployeeFormBasicInformations(ewEmployeeFormBasicInformationsId);
  const newEmployeeFormDataAgreement = await fetchNewEmployeeFormBasicInformations(newEmployeeFormDataAgreementId);
  const newEmployeeFormDataAgreementHeading = await fetchNewEmployeeFormBasicInformations(newEmployeeFormDataAgreementHeadingId);
  const management = await fetchManagement();
  const newEmployeePersonalTeamMainHeading = await fetchNewEmployeeFormBasicInformations(newEmployeePersonalTeamMainHeadingId);
  const newEmployeePersonalTeamFooter = await fetchNewEmployeeFormBasicInformations(newEmployeePersonalTeamFooterId);
  const newEmployeeFormPersonalInformationsHeading = await fetchNewEmployeeFormBasicInformations(newEmployeeFormPersonalInformationsHeadingId);

    return (

      <PageComponent newEmployeeFormBasicInformations={newEmployeeFormBasicInformations ?? ""} newEmployeeFormDataAgreement={newEmployeeFormDataAgreement ?? ""} newEmployeeFormDataAgreementHeading={newEmployeeFormDataAgreementHeading??""} management={management as unknown as Management[]} newEmployeePersonalTeamHeading={newEmployeePersonalTeamHeading ?? ""} newEmployeePersonalTeamMainHeading={newEmployeePersonalTeamMainHeading??""} newEmployeePersonalTeamFooter={newEmployeePersonalTeamFooter??""} newEmployeeFormPersonalInformationsHeading={newEmployeeFormPersonalInformationsHeading ?? ""}newEmployeeFormPreferencesHeading={newEmployeeFormPreferencesHeading ?? ""} />
      
  );
}
