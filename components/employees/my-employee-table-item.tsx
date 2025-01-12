"use client";

import Image from "next/image";
import { EmployeeToDisplay } from "@/app/lib/models";
import { useRouter } from 'next/navigation';


interface Colors {
  [key: string]: {
    text: string;
  };
}

const colors: Colors = {
  default: {
    text: "text-black",
  },
  NaN: {
    text: "text-red-500",
  },
};
const starColors: Colors = {
  default: {
    text: "text-red-500",
  },
  orange: {
    text: "text-amber-500",
  },
  red: {
    text: "text-red-500",
  },
  green: {
    text: "text-green-500",
  },
};

export default function CustomersTableItem(employee: EmployeeToDisplay) {
  const router = useRouter();
  const readableDate = (info: string | null) => {
    if (info === null || info === undefined || info === "NaN") return "";
    const returnDate = new Date(info).toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return returnDate;
  };
  const nullAndUndefined = (info: string | null | string | number) => {
    if (info === null || info === undefined || info === "NaN") return "NaN";
    return info;
  };
  const distinction =
    employee.distinction === "NaN" ? "" : employee.distinction;

const redirectFn = ()=>{
  router.push(`/personalistika/zamestnanci/${employee.id}`);
}


  return (
  <tr onClick={redirectFn}>
      {/* <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
        <div className="flex items-center">
          <label className="inline-flex">
            <span className="sr-only">Select</span>
            <input className="form-checkbox" type="checkbox"  />
          </label>
        </div>
      </td> */}
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-1">
        <div className="flex items-center relative">
          <button>
          <svg
      className={`w-4 h-4 shrink-0 fill-current `}
      viewBox="0 0 16 16"
    >
      <path d="M8 0L6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934h-6L8 0z" />
    </svg>
          </button>
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap  sm:hidden">
        <div className="flex items-left">
          <div className="w-10 h-10 shrink-0 mr-2 sm:mr-3">
            <Image
              className="rounded-full"
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${employee.photo || "699729d7-e5fb-48e8-930c-6510fc06eb03"}`}

              width={40}
              height={40}
              alt={employee.secondName}
            />
          </div>
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap sticky left-0 z-10 bg-slate-800 sm:hidden">
        <div className="text-left border-0 border-r pr-2">
          {employee.secondName}{" "}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap sm:hidden">
        <div className="text-left"> {employee.firstName}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap sm:hidden">
        <div className="text-left"> {distinction}</div>
      </td>

      <td className="px-3 first:pl-5 last:pr-5 py-3 whitespace-nowrap sticky left-0 z-10 bg-slate-800  items-center hidden sm:flex">
        <div className="w-10 h-10 mr-2 sm:mr-3">
          <Image
            className="rounded-full"
            src={employee.photo?`https://directus.aglikace.cz/assets/${employee.photo}`:"https://directus.aglikace.cz/assets/699729d7-e5fb-48e8-930c-6510fc06eb03"}
            width={40}
            height={40}
            alt={employee.secondName}
          />
        </div>
        <div className="text-left border-0 border-r pr-2 max-w-full flex-grow">
          {employee.secondName} {employee.firstName} {distinction}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left">{readableDate(employee.date_created)}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-center">{readableDate(employee.dateOfBirth)}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium text-sky-500 ${
            colors[nullAndUndefined(employee.phone)]?.text
          }`}
        >
          {nullAndUndefined(employee.phone)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.certificate)]?.text
          }`}
        >
          {nullAndUndefined(employee.certificate)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.criminalRecord)]?.text
          }`}
        >
          {nullAndUndefined(employee.criminalRecord)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.healtCheck)]?.text
          }`}
        >
          {nullAndUndefined(employee.healtCheck)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.email)]?.text
          }`}
        >
          {nullAndUndefined(employee.email)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.pid)]?.text
          }`}
        >
          {nullAndUndefined(employee.pid)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.insurance)]?.text
          }`}
        >
          {nullAndUndefined(employee.insurance)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.state)]?.text
          }`}
        >
          {nullAndUndefined(employee.state)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-left font-medium ${
            colors[nullAndUndefined(employee.acount)]?.text
          }`}
        >
          {nullAndUndefined(employee.acount)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-left font-medium ${
            colors[nullAndUndefined(employee.adress)]?.text
          }`}
        >
          {nullAndUndefined(employee.adress)}
        </div>
      </td>

      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.boty)]?.text
          }`}
        >
          {nullAndUndefined(employee.boty)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.kalhoty)]?.text
          }`}
        >
          {nullAndUndefined(employee.kalhoty)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.triko)]?.text
          }`}
        >
          {nullAndUndefined(employee.triko)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.mikina)]?.text
          }`}
        >
          {nullAndUndefined(employee.mikina)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.softschell)]?.text
          }`}
        >
          {nullAndUndefined(employee.softschell)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.zimnibunda)]?.text
          }`}
        >
          {nullAndUndefined(employee.zimnibunda)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-left font-medium ${
            colors[nullAndUndefined(employee.recruitment)]?.text
          }`}
        >
          {nullAndUndefined(employee.recruitment)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.practice)]?.text
          }`}
        >
          {nullAndUndefined(employee.practice)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.healthStatus)]?.text
          }`}
        >
          {nullAndUndefined(employee.healthStatus)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.smoker)]?.text
          }`}
        >
          {nullAndUndefined(employee.smoker)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.shifts)]?.text
          }`}
        >
          {nullAndUndefined(employee.shifts)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.shiftsValue)]?.text
          }`}
        >
          {nullAndUndefined(employee.shiftsValue)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-left font-medium ${
            colors[nullAndUndefined(employee.dateOfEmployment)]?.text
          }`}
        >
          {nullAndUndefined(employee.dateOfEmployment)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.otherDPP)]?.text
          }`}
        >
          {nullAndUndefined(employee.otherDPP)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.otherDPPValue)]?.text
          }`}
        >
          {nullAndUndefined(employee.otherDPPValue)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.execution)]?.text
          }`}
        >
          {nullAndUndefined(employee.execution)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.valueOfExecution)]?.text
          }`}
        >
          {nullAndUndefined(employee.valueOfExecution)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div
          className={`text-center font-medium ${
            colors[nullAndUndefined(employee.comment)]?.text
          }`}
        >
          {nullAndUndefined(employee.comment)}
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
        {/* Menu button */}
        <button className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 rounded-full">
          <span className="sr-only">Menu</span>
          <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="2" />
            <circle cx="10" cy="16" r="2" />
            <circle cx="22" cy="16" r="2" />
          </svg>
        </button>
      </td>
    </tr>
  );
}
