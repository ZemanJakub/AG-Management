"use client";
// export const metadata = {
//   title: "Přijímací proces",
//   description: "Přijímací proces",
// };

// import FilterButton from "@/components/default-components/dropdown-filter";
// import EmployesTable from "../../../components/employees/my-employes-table";
// import PaginationClassic from "@/components/default-components/pagination-classic";
// import SearchForm from "@/components/default-components/search-form";

// import { directus } from "@/app/lib/directus";
// import { readItems } from "@directus/sdk";
// import { EmployeeToDisplay } from "@/app/lib/models";
// import Link from "next/link";
import HrTable from "./hrtable";

export default function Customers() {
  // fetch newemployee data start
  // const result = await directus.request(
  //   readItems("employees")
  // );
  // console.log("fetch items zamestnanci", result.length)
  // fetch newemployee data end

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-32 py-8 w-full max-w-[-10rem] mx-auto">
 
      <HrTable/>

    </div>
  );
}
