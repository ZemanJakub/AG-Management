import Image from "next/image";
import ProfileBg from "@/public/images/profile-bg.jpg";
import { fetchBasicEmployeeData } from "@/db/queries/employees";
import UpdatePhoto from "./update-photo";
import { EmployeeToDisplay } from "@/app/lib/models";

interface PageHeaderProps {
  id: string;
  employeeData: EmployeeToDisplay;
}
export default async function PageHeaderEdit({ id, employeeData}: PageHeaderProps) {


  const value = {
    photo: employeeData?.photo || "",
  };
  return (
    <div
    className={`grow bg-white dark:bg-slate-900 flex flex-col md:translate-x-0 transition-transform duration-300 ease-in-out translate-x-0
  `}
  >
    {/* Profile background */}
    <div className="relative h-56 bg-slate-200 dark:bg-slate-900">
      <Image
        className="object-cover h-full w-full"
        src={ProfileBg}
        width={979}
        height={220}
        alt="Profile background"
      />
    </div>
    <div className="relative px-4 sm:px-6 pb-2">
      {/* Pre-header */}
      <div className="-mt-16 mb-6 sm:mb-3">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-end">
          {/* Avatar */}
          <UpdatePhoto id={id} photo={employeeData.photo} firstName={employeeData.firstName} secondName={employeeData.secondName} />
         
        </div>
      </div>

      {/* Header */}
      <header className="text-center sm:text-left mb-6">
        {/* Name */}
        <div className="inline-flex items-start mb-2">
          <h1 className="text-2xl text-slate-800 dark:text-slate-100 font-bold">{`${employeeData.firstName} ${employeeData.secondName}`}</h1>
          <svg
            className="w-4 h-4 fill-current shrink-0 text-amber-500 ml-2"
            viewBox="0 0 16 16"
          >
            <path d="M13 6a.75.75 0 0 1-.75-.75 1.5 1.5 0 0 0-1.5-1.5.75.75 0 1 1 0-1.5 1.5 1.5 0 0 0 1.5-1.5.75.75 0 1 1 1.5 0 1.5 1.5 0 0 0 1.5 1.5.75.75 0 1 1 0 1.5 1.5 1.5 0 0 0-1.5 1.5A.75.75 0 0 1 13 6ZM6 16a1 1 0 0 1-1-1 4 4 0 0 0-4-4 1 1 0 0 1 0-2 4 4 0 0 0 4-4 1 1 0 1 1 2 0 4 4 0 0 0 4 4 1 1 0 0 1 0 2 4 4 0 0 0-4 4 1 1 0 0 1-1 1Z" />
          </svg>
        </div>
        {/* Meta */}
        <div className="flex flex-wrap justify-center sm:justify-start space-x-4">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 fill-current shrink-0 text-slate-400 dark:text-slate-500"
              viewBox="0 0 16 16"
            >
              <path d="M8 8.992a2 2 0 1 1-.002-3.998A2 2 0 0 1 8 8.992Zm-.7 6.694c-.1-.1-4.2-3.696-4.2-3.796C1.7 10.69 1 8.892 1 6.994 1 3.097 4.1 0 8 0s7 3.097 7 6.994c0 1.898-.7 3.697-2.1 4.996-.1.1-4.1 3.696-4.2 3.796-.4.3-1 .3-1.4-.1Zm-2.7-4.995L8 13.688l3.4-2.997c1-1 1.6-2.198 1.6-3.597 0-2.798-2.2-4.996-5-4.996S3 4.196 3 6.994c0 1.399.6 2.698 1.6 3.697 0-.1 0-.1 0 0Z" />
            </svg>
            <span className="text-sm font-medium whitespace-nowrap text-slate-500 dark:text-slate-400 ml-2">
              {employeeData.adress}
            </span>
          </div>
        </div>
      </header>
      </div>
      </div>
  );
}
