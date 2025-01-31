
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
const newEmployeeFormHealthHeadingId = "fb669e91-f6da-4960-9cca-4d2140152051"
const newEmployeeFormQualificationHeadingId = "a937a95d-3b7c-4fba-ad05-9dba19723043"
const newEmployeeFormCommitmentHeadingId = "c9924010-1784-47ae-b78a-122a30c315df"
const newEmployeeFormHowDidYouFindUsHeadingId = "4ee2d9f3-eb02-4551-8ded-490d5bbcc997"
const newEmployeeFormPhotoInformationsId = 
"65aaf075-7553-4e4a-8e8b-2c04b82340b3"

  
const newEmployeeFormHealthHeading = await fetchNewEmployeeFormBasicInformations(newEmployeeFormHealthHeadingId);
  const newEmployeeFormPreferencesHeading = await fetchNewEmployeeFormBasicInformations(newEmployeeFormPreferencesHeadingId);
  const newEmployeePersonalTeamHeading = await fetchNewEmployeeFormBasicInformations(newEmployeePersonalTeamHeadingId);
  const newEmployeeFormBasicInformations = await fetchNewEmployeeFormBasicInformations(ewEmployeeFormBasicInformationsId);
  const newEmployeeFormDataAgreement = await fetchNewEmployeeFormBasicInformations(newEmployeeFormDataAgreementId);
  const newEmployeeFormDataAgreementHeading = await fetchNewEmployeeFormBasicInformations(newEmployeeFormDataAgreementHeadingId);
  const management = await fetchManagement();
  const newEmployeePersonalTeamMainHeading = await fetchNewEmployeeFormBasicInformations(newEmployeePersonalTeamMainHeadingId);
  const newEmployeePersonalTeamFooter = await fetchNewEmployeeFormBasicInformations(newEmployeePersonalTeamFooterId);
  const newEmployeeFormPersonalInformationsHeading = await fetchNewEmployeeFormBasicInformations(newEmployeeFormPersonalInformationsHeadingId);
  const newEmployeeFormQualificationHeading = await fetchNewEmployeeFormBasicInformations(newEmployeeFormQualificationHeadingId);
  const newEmployeeFormCommitmentHeading = await fetchNewEmployeeFormBasicInformations(newEmployeeFormCommitmentHeadingId);
  const newEmployeeFormHowDidYouFindUsHeading = await fetchNewEmployeeFormBasicInformations(newEmployeeFormHowDidYouFindUsHeadingId);
  const newEmployeeFormPhotoInformations = await fetchNewEmployeeFormBasicInformations(newEmployeeFormPhotoInformationsId);

    return (

      <PageComponent newEmployeeFormBasicInformations={newEmployeeFormBasicInformations ?? ""} newEmployeeFormDataAgreement={newEmployeeFormDataAgreement ?? ""} newEmployeeFormDataAgreementHeading={newEmployeeFormDataAgreementHeading??""} management={management as unknown as Management[]} newEmployeePersonalTeamHeading={newEmployeePersonalTeamHeading ?? ""} newEmployeePersonalTeamMainHeading={newEmployeePersonalTeamMainHeading??""} newEmployeePersonalTeamFooter={newEmployeePersonalTeamFooter??""} newEmployeeFormPersonalInformationsHeading={newEmployeeFormPersonalInformationsHeading ?? ""}newEmployeeFormPreferencesHeading={newEmployeeFormPreferencesHeading ?? ""}newEmployeeFormHealthHeading = {newEmployeeFormHealthHeading??""} newEmployeeFormQualificationHeading = {newEmployeeFormQualificationHeading??""} newEmployeeFormCommitmentHeading = {newEmployeeFormCommitmentHeading ?? ""} newEmployeeFormHowDidYouFindUsHeading = {newEmployeeFormHowDidYouFindUsHeading??""} newEmployeeFormPhotoInformations={newEmployeeFormPhotoInformations??""}/>
      
  );
}
