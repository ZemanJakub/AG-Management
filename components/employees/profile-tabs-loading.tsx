
import Link from "next/link";

export default function ProfileTabsLoading() {

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
                 "block pb-3 focus: text-indigo-500 whitespace-nowrap border-b-2 border-indigo-500"
                  
              }
              href={{
                pathname: ``
              }}
            >
              Úvod
            </Link>
          </li>
          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            // className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              className={
                "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
              }
              href={{
                pathname: ``,
              }}
            >
              Personalistika
            </Link>
          </li>

          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            //   className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
            className={
              "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
            }
            href={{
              pathname: ``,
            }}
            >
              Dokumenty
            </Link>
          </li>
          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            //   className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
                className={
                  "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
                }
                href={{
                  pathname: ``,
                }}
            >
              Výstroj
            </Link>
          </li>
          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            //   className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
            className={
              "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
            }
            href={{
              pathname: ``,
            }}
            >
              Školení
            </Link>
          </li>
          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            //   className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
            className={
              "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
            }
            href={{
              pathname: ``,
            }}
            >
              Evidence docházky
            </Link>
          </li>
          <li className="cursor-pointer mr-6 last:mr-0 first:pl-4 sm:first:pl-6 lg:first:pl-8 last:pr-4 sm:last:pr-6 lg:last:pr-8">
            <Link
            //   className="block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
            className={
              "block pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 whitespace-nowrap"
            }
            href={{
              pathname: ``,
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
