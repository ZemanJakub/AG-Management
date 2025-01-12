import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";
import { DataForSession } from "@/app/lib//models";

export const metadata = {
  title: 'Feedback Settings',
  description: 'Send us your feedback.',
}

import SettingsSidebar from '../settings-sidebar'
import FeedbackPanel from './feedback-panel'

export default async function FeedbackSettings() {

  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const userData = session?.payload as unknown as DataForSession;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

      {/* Page header */}
      <div className="mb-8">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Nastavení</h1>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl mb-8">
        <div className="flex flex-col md:flex-row md:-mr-px">

          <SettingsSidebar />
          <FeedbackPanel userData={userData}/>

        </div>
      </div>

    </div>
  )
}