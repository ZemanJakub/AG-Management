// app/avaris-data/page.tsx

"use client";

import { useState, useRef, FormEvent } from "react";
import Link from "next/link";
import { getAvarisData } from "@/actions/avaris/avaris";
import {
  Button,
  CardBody,
  CardHeader,
  DatePicker,
  Select,
  SelectItem,
} from "@heroui/react";
import { Input } from "@heroui/react";

import { Card } from "@heroui/react";
import { Alert } from "@heroui/react";
import { DocumentDrop } from "@/modules/avaris/components/document-drop";

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
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const today = new Date();
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

  const handleSelectionChange = (e: any) => {
    console.log(e.target.value.split(","));
    setValues(new Set(e.target.value.split(",")));
  };

  const handleFileUploaded = (fileName: string) => {
    console.log('Soubor nahrán:', fileName);
    setIsFileLoaded(true);
    // Můžete zde přidat další akce při nahrání souboru
  };

  const handleFileDelete = (fileName: string) => {
    setIsFileLoaded(false);
    console.log('Soubor odstraněn:', fileName);
    // Můžete zde přidat další akce při odstranění souboru
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Data z portálu Avaris</h1>
      {error && <Alert variant="solid">{error}</Alert>}

      <Card>
        <CardHeader>
          <p className="text-lg font-semibold">Informace o zpracování</p>
        </CardHeader>
        <CardBody className="mt-0 p-0">
          <ul className="list-disc ml-6 mb-4">
            <li className="pt-1">
              Filtruje záznamy s příznakem <strong>ST</strong>
            </li>
            <li className="pt-1">Odstraňuje sloupce "Typ" a "Strážný"</li>
            <li className="pt-1">Přidává sloupec s časem ve formátu "7:15"</li>
            <li className="pt-1">Exportuje data do formátu XLSX</li>
          </ul>
        </CardBody>
      </Card>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        <h2 className= "text-lg font-semibold">Příhlašovací údaje do Avarisu a údaje o požadovaném snímači:</h2>
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
              label="Vybraný objekt"
              id="objekty"
              name="objekty"
              placeholder="Vyber objekt"
              selectedKeys={values}
              variant="bordered"
              onChange={handleSelectionChange}
            >
              {animals.map((animal) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <h2 className= "text-lg font-semibold">Zadej zájmové období:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            className="max-w-xs"
            name="dateFrom"
            variant="bordered"
            label="Datum od"
            id="dateFrom"
          />
          <DatePicker
            className="max-w-xs"
            variant="bordered"
            name="dateTo"
            label="Datum do"
            id="dateTo"
          />
        </div>
        <DocumentDrop 
          onFileUploaded={handleFileUploaded}
          onFileDelete={handleFileDelete}
        />
        <div className="w-full flex justify-center mt-11">
          <Button
            type="submit"
            disabled={loading}
            color="secondary"
            isDisabled={!isFileLoaded}

          >
            {loading ? "Načítání.........." : "Získat data z Avarisu"}
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