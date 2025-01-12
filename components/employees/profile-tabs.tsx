
import Link from "next/link";



interface ProfileBodyProps {
  id: string;
  edit?: boolean;
  namep?: string|undefined;
}

export default function ProfileTabs({ id,edit,namep }: ProfileBodyProps) {

  return (
    <div className="relative px-4 sm:px-6">
      <div className="relative mb-6">
        <div
          className="absolute bottom-0 w-full h-px bg-slate-200 dark:bg-slate-700"
          aria-hidden="true"
        ></div>
        <ul className="relative text-sm font-medium flex flex-nowrap -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-scroll no-scrollbar">
          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            // className="block pb-3 focus: text-indigo-500 whitespace-nowrap border-b-2 border-indigo-500"
              className={
                namep === undefined
                  ? "block pb-3 focus: text-indigo-500 whitespace-nowrap border-b-2 border-indigo-500"
                  : "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              }
              href={{
                pathname: edit?`/personalistika/zamestnanci/${id}/edit`:`/personalistika/zamestnanci/${id}`,
              }}
            >
              Úvod
            </Link>
          </li>
          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            // className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              className={
                namep === "Personalistika"
              ? "block pb-3 focus: text-indigo-500 whitespace-nowrap border-b-2 border-indigo-500"
              : "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              }
              href={{
                pathname: edit?`/personalistika/zamestnanci/${id}/edit`:`/personalistika/zamestnanci/${id}`,
                query: { name: "Personalistika" },
              }}
            >
              Personalistika
            </Link>
          </li>

          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            //   className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              className={
                namep === "Dokumenty"
                  ? "block pb-3 focus: text-indigo-500 whitespace-nowrap border-b-2 border-indigo-500"
                  : "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              }
              href={{
                pathname: edit?`/personalistika/zamestnanci/${id}/edit`:`/personalistika/zamestnanci/${id}`,
                query: { name: "Dokumenty" },
              }}
            >
              Dokumenty
            </Link>
          </li>
          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            //   className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              className={
                namep === "Výstroj"
                  ? "block pb-3 focus: text-indigo-500 whitespace-nowrap border-b-2 border-indigo-500"
                  : "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              }
              href={{
                pathname: edit?`/personalistika/zamestnanci/${id}/edit`:`/personalistika/zamestnanci/${id}`,
                query: { name: "Výstroj" },
              }}
            >
              Výstroj
            </Link>
          </li>
          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            //   className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              className={
                namep === "Školení"
                  ? "block pb-3 focus: text-indigo-500 whitespace-nowrap border-b-2 border-indigo-500"
                  : "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              }
              href={{
                pathname: edit?`/personalistika/zamestnanci/${id}/edit`:`/personalistika/zamestnanci/${id}`,
                query: { name: "Školení" },
              }}
            >
              Školení
            </Link>
          </li>
          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            //   className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              className={
                namep === "Evidence docházky"
                  ? "block pb-3 focus: text-indigo-500 whitespace-nowrap border-b-2 border-indigo-500"
                  : "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              }
              href={{
                pathname: edit?`/personalistika/zamestnanci/${id}/edit`:`/personalistika/zamestnanci/${id}`,
                query: { name: "Evidence docházky" },
              }}
            >
              Evidence docházky
            </Link>
          </li>
          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            //   className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              className={
                namep === "Mzdy"
                  ? "block pb-3 focus: text-indigo-500 whitespace-nowrap border-b-2 border-indigo-500"
                  : "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              }

              href={{
                pathname: edit?`/personalistika/zamestnanci/${id}/edit`:`/personalistika/zamestnanci/${id}`,
                query: { name: "Mzdy" },
              }}
            >
              Mzdy
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
