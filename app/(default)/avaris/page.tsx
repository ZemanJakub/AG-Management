// app/avaris-data/page.tsx

"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import Link from "next/link";
import { getAvarisData } from "@/actions/avaris/avaris";
import { Button, CardHeader, Select, SelectItem } from "@heroui/react";
import { Input } from "@heroui/react";
import { Textarea } from "@heroui/react";
import { Card } from "@heroui/react";
import { Alert } from "@heroui/react";

const animals = [
  { key: "RENOCAR", label: "RENOCAR" },
  { key: "BPK", label: "BPK" },
  { key: "TOP HOTEL", label: "TOP HOTEL" },
  { key: "AG KANCELÁŘ", label: "AG KANCELÁŘ" },
  { key: "DRAMEDY STUDIOS", label: "DRAMEDY STUDIOS" },
  { key: "JEDNA RODINA", label: "JEDNA RODINA" },
  { key: "KARLŮV MOST", label: "KARLŮV MOST" },
  { key: "M2C LKQ CS D1", label: "M2C LKQ CS D1" },
  { key: "M2C LKQ CS D5", label: "M2C LKQ CS D5" },
  { key: "ORDINACE V RŮŽOVÉ ZAHRADĚ", label: "ORDINACE V RŮŽOVÉ ZAHRADĚ" },
  { key: "P3", label: "P3" },
  { key: "RADVAN", label: "RADVAN" },
  { key: "SERVIS - SVJ NA OKRAJI", label: "SERVIS - SVJ NA OKRAJI" },
  { key: "SVJ NA CÍSAŘCE", label: "SVJ NA CÍSAŘCE" },
  { key: "SVJ NA HŘEBENKÁCH", label: "SVJ NA HŘEBENKÁCH" },  
];

export default function AvarisPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Set<string>>(new Set([]));
  const today = new Date();
  const formatDate = (date: Date) =>
    `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await getAvarisData(formData);

      response.success
        ? setResult(response)
        : response.error && setError(response.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Neznámá chyba");
    } finally {
      setLoading(false);
    }
  }


const handleSelectionChange = (e:any) => {
  console.log(e.target.value.split(","))
  setValues(new Set(e.target.value.split(",")));
};
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Data z portálu Avaris</h1>
      {error && <Alert variant="solid">{error}</Alert>}

      <Card>
        <p>
          Tato aplikace stahuje data z portálu Avaris a provádí následující
          úpravy:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>
            Filtruje záznamy s příznakem <strong>ST</strong>
          </li>
          <li>Odstraňuje sloupce "Typ" a "Strážný"</li>
          <li>Přidává sloupec s časem ve formátu "7:15"</li>
          <li>Exportuje data do formátu XLSX</li>
        </ul>
      </Card>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     
          <Input
            id="username"
            name="username"
            defaultValue="reditel@ares-group.cz"
            label="Uživatelské jméno"
            required
            className="max-w-xs" 
            variant="bordered"
            classNames={{
              input:
                "border-none focus:ring-0 focus:outline-none rounded-md p-0",
            }}
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Heslo"
            className="max-w-xs"
            defaultValue="slunicko"
             variant="bordered"
            required
            classNames={{
              input:
                "border-none focus:ring-0 focus:outline-none rounded-md p-0",
            }}
          />
               <Input
            id="ico"
            name="ico"
            label="IČO"
            className="max-w-xs"
            defaultValue="25790668"
             variant="bordered"
            required
            classNames={{
             input:
                "border-none focus:ring-0 focus:outline-none rounded-md p-0",
            }}
          />
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Select
              className="max-w-xs"
              label="Vybrané objekty"
              id="objekty"
              name="objekty"
              placeholder="Vyber objekt"
              selectedKeys={values}
               variant="bordered"
              selectionMode="multiple"
              onChange={handleSelectionChange}
            >
              {animals.map((animal) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="dateFrom"
            label="Od"
            className="max-w-xs"
            name="dateFrom"
            defaultValue={formatDate(sevenDaysAgo)}
             variant="bordered"
            classNames={{
              input:
                "border-none focus:ring-0 focus:outline-none rounded-md p-0",
            }}
          />
          <Input
            id="dateTo"
            name="dateTo"
            label="Do"
            className="max-w-xs"
            defaultValue={formatDate(today)}
             variant="bordered"
            classNames={{
              input:
                "border-none focus:ring-0 focus:outline-none rounded-md p-0",
            }}
          />
        </div>
        <div className="w-full flex justify-center mt-11">
          <Button
            type="submit"
            disabled={loading}
            className="w-32 mx-auto"
            color="secondary"
          >
            {loading ? "Načítání..." : "Získat data"}
          </Button>
        </div>
      </form>

      {loading && <Alert variant="solid">Probíhá zpracování...</Alert>}

      {result && (
        <Card className="mt-4">
          <CardHeader>
            <p className="text-lg font-semibold">
              Export dokončen {new Date(result.timestamp).toLocaleString("cs")}
            </p>
          </CardHeader>
          <div className="flex mt-4">
            {Object.entries(result.processedData).map(
              ([objektName, data]: [string, any]) =>
                data.success &&
                data.xlsxFilePath && (
                  <Card
                    key={objektName}
                    className=" ml-4 mr-4 mb-4 min-w-72 max-w-96"
                  >
                    <p className="text-lg font-semibold pt-3 pb-2 pl-3">
                      {objektName}
                    </p>
                    <p className="text-sm text-gray-600 pl-3 pb-3">
                      Nalezeno {data.data?.length || 0} záznamů z{" "}
                      {data.summary?.totalRecords}
                    </p>
                    <Button
                      className="max-w-32 m-3 hover:underline"
                      color="success"
                      variant="flat"
                    >
                      <Link href={data.xlsxFilePath}>Stáhnout soubor</Link>
                    </Button>
                  </Card>
                )
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// 'use client'

// import { useState, useRef, FormEvent } from 'react';
// import Link from 'next/link';
// import { getAvarisData } from '@/actions/avaris/avaris';

// export default function AvarisPage() {
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const formRef = useRef<HTMLFormElement>(null);

//   // Získání aktuálního data pro výchozí hodnoty
//   const today = new Date();
//   const formatDate = (date: Date) => {
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}.${month}.${year}`;
//   };

//   // Výchozí datum od: o 7 dní zpět
//   const sevenDaysAgo = new Date(today);
//   sevenDaysAgo.setDate(today.getDate() - 7);

//   const [defaultDateFrom] = useState(formatDate(sevenDaysAgo));
//   const [defaultDateTo] = useState(formatDate(today));

//   async function handleSubmit(e: FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const formData = new FormData(e.currentTarget);
//       const response = await getAvarisData(formData);

//       if (!response.success && response.error) {
//         setError(response.error);
//       } else {
//         setResult(response);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Neznámá chyba');
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Data z portálu Avaris</h1>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
//         <h2 className="text-lg font-semibold mb-2">Informace o zpracování</h2>
//         <p>
//           Tato aplikace stahuje data z portálu Avaris a provádí následující úpravy:
//         </p>
//         <ul className="list-disc ml-6 mt-2">
//           <li>Filtruje záznamy a ponechává pouze ty s příznakem <strong>ST</strong></li>
//           <li>Odstraňuje sloupce "Typ" a "Strážný"</li>
//           <li>Přidává sloupec s časem ve formátu "7:15"</li>
//           <li>Exportuje upravená data do formátu XLSX</li>
//         </ul>
//         <p className="mt-2 text-sm text-gray-600">
//           Poznámka: Stažené soubory budou automaticky odstraněny po 5 minutách od vygenerování.
//         </p>
//       </div>

//       <form ref={formRef} onSubmit={handleSubmit} className="mb-8">
//         <div className="mb-4">
//           <label htmlFor="ico" className="block mb-2">IČO:</label>
//           <input
//             type="text"
//             id="ico"
//             name="ico"
//             className="border rounded px-3 py-2 w-full"
//             defaultValue="25790668"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label htmlFor="username" className="block mb-2">Uživatelské jméno:</label>
//           <input
//             type="text"
//             id="username"
//             name="username"
//             className="border rounded px-3 py-2 w-full"
//             defaultValue="reditel@ares-group.cz"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label htmlFor="password" className="block mb-2">Heslo:</label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             className="border rounded px-3 py-2 w-full"
//             defaultValue="slunicko"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label htmlFor="objekty" className="block mb-2">Objekty (jeden na řádek nebo oddělené čárkou):</label>
//           <textarea
//             id="objekty"
//             name="objekty"
//             className="border rounded px-3 py-2 w-full h-32"
//             defaultValue="RENOCAR"
//             placeholder="Zadejte názvy objektů, každý na nový řádek nebo oddělené čárkou"
//           />
//           <p className="text-sm text-gray-500 mt-1">Příklad: RENOCAR, ARIS, HOTEL AVION</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div>
//             <label htmlFor="dateFrom" className="block mb-2">Datum od:</label>
//             <input
//               type="text"
//               id="dateFrom"
//               name="dateFrom"
//               defaultValue={defaultDateFrom}
//               placeholder="DD.MM.RRRR"
//               className="border rounded px-3 py-2 w-full"
//             />
//             <p className="text-sm text-gray-500 mt-1">Formát: DD.MM.RRRR (např. 01.03.2025)</p>
//           </div>

//           <div>
//             <label htmlFor="dateTo" className="block mb-2">Datum do:</label>
//             <input
//               type="text"
//               id="dateTo"
//               name="dateTo"
//               defaultValue={defaultDateTo}
//               placeholder="DD.MM.RRRR"
//               className="border rounded px-3 py-2 w-full"
//             />
//             <p className="text-sm text-gray-500 mt-1">Formát: DD.MM.RRRR (např. 07.03.2025)</p>
//           </div>
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
//         >
//           {loading ? 'Zpracovávám...' : 'Získat data'}
//         </button>
//       </form>

//       {loading && (
//         <div className="border rounded p-4 mb-4 bg-yellow-50">
//           <h2 className="text-xl font-bold mb-2">Probíhá zpracování</h2>
//           <p>Stahování a zpracování dat může trvat několik minut, zejména při více objektech. Prosím, vyčkejte.</p>
//         </div>
//       )}

//       {result && (
//         <div className="border rounded p-4">
//           <h2 className="text-xl font-bold mb-2">Export dokončen</h2>
//           <p className="mb-4">
//             Data byla úspěšně exportována {new Date(result.timestamp).toLocaleString('cs')}.
//           </p>

//           {result.processedData && Object.keys(result.processedData).length > 0 && (
//             <div className="mb-4">
//               <h3 className="text-lg font-bold mb-2">Zpracované soubory:</h3>

//               <div className="grid gap-4 mt-4">
//                 {Object.entries(result.processedData).map(([objektName, data]: [string, any]) => {
//                   if (data.success && data.xlsxFilePath) {
//                     return (
//                       <div key={objektName} className="border rounded p-4">
//                         <h4 className="text-lg font-semibold mb-2">{objektName}</h4>

//                         <div className="flex justify-between items-center">
//                           <div>
//                             {data.summary && (
//                               <div className="text-sm text-gray-600">
//                                 Nalezeno {data.data?.length || 0} záznamů s příznakem ST
//                                 z celkových {data.summary.totalRecords}
//                               </div>
//                             )}
//                           </div>

//                           <Link
//                             href={data.xlsxFilePath}
//                             className="text-green-600 hover:underline inline-block bg-green-50 px-3 py-2 rounded border border-green-200"
//                           >
//                             <div className="flex items-center">
//                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                               </svg>
//                               Stáhnout Excel
//                             </div>
//                           </Link>
//                         </div>
//                       </div>
//                     );
//                   }
//                   return null;
//                 })}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
