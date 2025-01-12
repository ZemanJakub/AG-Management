import Sidebar from "@/components/default-components/ui/sidebar";
import Header from "@/components/default-components/ui/header";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { DataForSession } from "@/app/lib//models";

export default async function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const userData = session?.payload as unknown as DataForSession;
  const userName = userData.first_name + " " + userData.last_name;
  const userId = userData.id?.toString() || "";
  const avatar = userData.avatar || "699729d7-e5fb-48e8-930c-6510fc06eb03";
  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header userName={userName} userId={userId} avatar={avatar}/>

        <main className="grow [&>*:first-child]:scroll-mt-16">{children}</main>
      </div>
    </div>
  );
}
