"use client";

import type { TeamMember } from "./team-member-card";

import { Spacer } from "@heroui/react";

import TeamMemberCard from "./team-member-card";

import { Management } from "./types";

const teamMembers: TeamMember[] = [
  {
    name: "Karel Kopecký",
    avatar: `https://directus.aglikace.cz/assets/4bf3de38-e88b-4c57-a3ae-33f65748fcbc`,
    role: "Zakladatel",
    bio: "Mou rolí je zejména vyhledávání nových příležitostí, klientů a reprezentace společnosti.",
    phone:"1",
    email:"1"
  },
  {
    name: "Mgr.Karel Kopecký, MBA",
    avatar: `https://directus.aglikace.cz/assets/bcd618da-a41e-4dc5-9f7e-ae7f49ca602e`,
    role: "Prokurista",
    bio: "Jsem zodpovědný za finanční otázky a strategické plánování naší společnosti. Mým cílem je zajistit, aby naše společnost byla vždy na správné cestě a aby byla schopna růst a rozvíjet se.",
    phone:"1",
    email:"1"
  },

  {
    name: "Jakub Zeman",
    avatar: `https://directus.aglikace.cz/assets/ab071389-cffe-47f3-8495-518c214a457f`,
    role: "Ředitel fyzické ostrahy",
    bio: "Mým úkolem je pečovat o stávající i potencionální klienty naší společnosti. Jsem zodpovědný za vedení týmu a za to, aby byly všechny úkoly splněny včas a kvalitně.",
    phone:"+420 602 323 359",
    email:"reditel@ares-group.cz"
  },
  {
    name: "Ing. Jan Chroust",
    avatar: `https://directus.aglikace.cz/assets/6bd028db-68ac-469d-a9c4-d8581c23aae7`,
    role: "Security manager, Vedoucí personalistiky",
    bio: "Mou zodpovědností je zajistit, aby byli všichni zaměstnanci naší společnosti spokojení a aby byli schopni plnit své úkoly co nejlépe. Jsem zodpovědný za výběr nových zaměstnanců a za to, aby byli všichni zaměstnanci na správném místě.",
   phone:"1",
      email:"1"
  },
  {
    name: "Václav Procházka",
    avatar: `https://directus.aglikace.cz/assets/a3c4ec25-2185-42a6-8179-2452a759e30d`,
    role: "Supervizor, Personalista",
    bio: "Mým úkolem je řídit zaměstnance na našich zakázkách, provádět bezpečnostní analýzy a osobně vést naše týmy na klíčových eventech. Sekundárním úkolem je výběr nových zaměstnanců a jejich zaškolování.",
    phone:"1",
    email:"1"
  },
  {
    name: "Veronika Havlová",
    avatar: `https://directus.aglikace.cz/assets/5de3477e-387c-4335-9e8a-a72a1eb4b911`,
    role: "Office manager",
    bio: "Dokumenty jsou mou vášní, mou zodpovědností je komunikace s úřady a zákazníky, vedení účetnictví a správa našeho kancelářského prostoru. Pokud bys měl nějaký problém s úřady nebo s nějakým dokumentem, jsem tu pro tebe.",
    phone:"1",
    email:"1"
  },
  {
    name: "Petr Vachuda",
    avatar: `https://directus.aglikace.cz/assets/f73c7445-e472-4dd6-9a65-ca0478a1390f`,
    role: "Key account manager",
    bio: "Mým úkolem je řídit provoz na klíčových zakázkách naší společnosti, komunikovat s klienty a zajistit, aby byly všechny jejich požadavky splněny včas a kvalitně.",
    phone:"1",
    email:"1"
  },
  {
    name: "Filip Kopecký",
    avatar: `https://directus.aglikace.cz/assets/4861ab76-e389-42f2-9751-340feb19980f`,
    role: "Junior manager",
    bio: "Mým úkolem je řídit zaměstnance na realizovaných eventech a zakázkách naší společnosti.",
    phone:"1",
    email:"1"
  },
];

interface PersonalTeamProps {
  management: Management[];
  newEmployeePersonalTeamHeading: string;
  newEmployeePersonalTeamMainHeading: string;
  newEmployeePersonalTeamFooter: string;
}


export default function PersonalTeam({management,newEmployeePersonalTeamHeading,newEmployeePersonalTeamMainHeading,newEmployeePersonalTeamFooter}: PersonalTeamProps) {
  return (
    <section className="flex flex-col items-center py-4  h-full">
      <div className="flex max-w-xl flex-col text-center">
        <h2 className="font-medium text-secondary">Přidej se k nám!</h2>
        <h1 className="text-4xl font-medium tracking-tight">
        {newEmployeePersonalTeamMainHeading}
        </h1>
        <Spacer y={4} />
        <h2 className="text-large text-default-500">
          {newEmployeePersonalTeamHeading}
        </h2>
        <Spacer y={4} />
        {/* <div className="flex w-full justify-center gap-2">
          <Button variant="ghost">About us</Button>
          <Button color="secondary">Open positions</Button>
        </div> */}
      </div>
      <div className="mt-12 grid  grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-2xl">
        {management.map((member, index) => (
          <TeamMemberCard key={index} {...member} />
        ))}
      </div>
      <div className="flex w-full justify-center gap-2 mt-6">
        <h2 className="text-large text-default-500">
        {newEmployeePersonalTeamFooter}
        </h2>

        </div>
    
    </section>
  );
}
