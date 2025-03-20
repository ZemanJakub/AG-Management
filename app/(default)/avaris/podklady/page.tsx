// app/avaris/podklady/page.tsx
"use client";

import { useState, useRef, FormEvent } from "react";
import Link from "next/link";
import {
  Button,
  CardBody,
  CardHeader,
  DatePicker,
  Select,
  SelectItem,
  Progress,
  Spinner,
} from "@heroui/react";
import { Card } from "@heroui/react";
import { Alert } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { DocumentDrop } from "@/modules/podklady/components/document-drop";
import { processAvarisWithExcel } from "@/actions";
import { loadSourceData, runAdvancedProcessing } from "@/actions";

// Předdefinované objekty pro výběr
const availableObjects = [
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
  { key: "SVJ NA OKRAJI", label: "SVJ NA OKRAJI" },
  { key: "SVJ NA CÍSAŘCE", label: "SVJ NA CÍSAŘCE" },
  { key: "SVJ NA HŘEBENKÁCH", label: "SVJ NA HŘEBENKÁCH" },
  { key: "NA LOVU", label: "NA LOVU" },
  { key: "M2C COMMSCOPE", label: "M2C COMMSCOPE" },
];

// Definice stavů zpracování
enum ProcessState {
  INITIAL = "INITIAL", // Počáteční stav
  LOADING = "LOADING", // Načítání dat
  PROCESSED = "PROCESSED", // Soubor byl úspěšně zpracován
  ADVANCED_PROCESSING = "ADVANCED_PROCESSING", // Probíhá pokročilé zpracování
  ADVANCED_COMPLETED = "ADVANCED_COMPLETED", // Pokročilé zpracování dokončeno
  ERROR = "ERROR", // Došlo k chybě
}

export default function PodkladyPage() {
  // Stavové proměnné
  const [processState, setProcessState] = useState<ProcessState>(
    ProcessState.INITIAL
  );
  const [result, setResult] = useState<any>(null);
  const [advancedResult, setAdvancedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0); // Pro progress bar
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(
    new Set([])
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [processingOptions, setProcessingOptions] = useState({
    compareNames: true,
    updateTimes: true,
    detectConsecutiveShifts: true,
  });
  // Reference na formulář
  const formRef = useRef<HTMLFormElement>(null);

  // Formátování data
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  // Změna vybraných objektů
  const handleSelectionChange = (e: any) => {
    const values = e.target.value.split(",");
    setSelectedObjects(new Set(values));
  };

  // Metoda, která se volá, když uživatel nahraje soubor
  const handleFileUploaded = (fileName: string) => {
    setUploadedFileName(fileName);
  };

  // Metoda, která se volá, když uživatel odstraní soubor
  const handleFileDelete = () => {
    setUploadedFileName(null);
  };

  // Zpracování formuláře
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Reset stavů
    setProcessState(ProcessState.LOADING);
    setError(null);
    setResult(null);
    setAdvancedResult(null);
    setProgress(0);

    if (!uploadedFileName) {
      setError("Nejprve nahrajte Excel soubor");
      setProcessState(ProcessState.ERROR);
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("fileName", uploadedFileName);
      formData.append("options", JSON.stringify(processingOptions));
      // Simulace progress baru
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5 * Math.random();
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      // Zavolání serverové akce
      const response = await processAvarisWithExcel(formData);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setResult(response);
        setProcessState(ProcessState.PROCESSED);
      } else {
        setError(response.error || "Došlo k neznámé chybě");
        setProcessState(ProcessState.ERROR);
      }
    } catch (err) {
      console.error("Exception caught:", err);
      setError(err instanceof Error ? err.message : "Neznámá chyba");
      setProcessState(ProcessState.ERROR);
      setProgress(0);
    }
  }

  // Spuštění pokročilého zpracování
  const handleRunAdvancedTest = async () => {
    setProcessState(ProcessState.ADVANCED_PROCESSING);
    setError(null);

    try {
      // Nejprve načteme testovací soubor
      const sourceResult = await loadSourceData(null, true);

      if (!sourceResult.success) {
        setError(
          sourceResult.error || "Chyba při načítání testovacího souboru"
        );
        setProcessState(ProcessState.ERROR);
        return;
      }

      // Spustíme pokročilé zpracování s testovacím souborem
      const advResult = await runAdvancedProcessing(
        sourceResult.sourceFile || "Testovací tabulka.xlsx",
        {
          compareNames: true,
          updateTimes: true,
          detectConsecutiveShifts: true,
        }
      );

      if (advResult.success) {
        setAdvancedResult(advResult);
        setProcessState(ProcessState.ADVANCED_COMPLETED);
      } else {
        setError(advResult.error || "Chyba při pokročilém zpracování");
        setProcessState(ProcessState.ERROR);
      }
    } catch (err) {
      console.error("Exception caught:", err);
      setError(err instanceof Error ? err.message : "Neznámá chyba");
      setProcessState(ProcessState.ERROR);
    }
  };

  // Render výsledků pro různé stavy
  const renderContent = () => {
    switch (processState) {
      case ProcessState.LOADING:
        return (
          <Card className="mt-6">
            <CardBody>
              <div className="flex flex-col items-center p-4">
                <Spinner size="lg" color="primary" className="mb-4" />
                <p className="text-lg mb-4">Probíhá zpracování dat...</p>
                <Progress
                  value={progress}
                  className="max-w-md w-full"
                  showValueLabel={true}
                  color="primary"
                />
              </div>
            </CardBody>
          </Card>
        );

      case ProcessState.ADVANCED_PROCESSING:
        return (
          <Card className="mt-6">
            <CardBody>
              <div className="flex flex-col items-center p-4">
                <Spinner size="lg" color="primary" className="mb-4" />
                <p className="text-lg mb-4">
                  Probíhá pokročilé zpracování dat...
                </p>
              </div>
            </CardBody>
          </Card>
        );

      case ProcessState.PROCESSED:
        return (
          <Card className="mt-6">
            <CardHeader>
              <p className="text-lg font-semibold">Zpracování dokončeno</p>
            </CardHeader>
            <CardBody>
              {result?.reportData && (
                <div className="mt-2 mb-6 border rounded-md p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Výsledky zpracování
                  </h3>

                  <div className="space-y-4">
                    {result.reportData.dataAdded !== undefined && (
                      <p className="text-lg">
                        Počet přidaných záznamů:{" "}
                        <strong>{result.reportData.dataAdded}</strong>
                      </p>
                    )}

                    {result.reportData.message && (
                      <p className="text-md">{result.reportData.message}</p>
                    )}
                  </div>
                </div>
              )}

              {result?.finalFilePath && (
                <div className="p-4 border border-green-200  rounded-md">
                  <p className="font-medium mb-4">
                    Soubor byl úspěšně aktualizován! Nyní si můžete stáhnout
                    výsledek:
                  </p>
                  <div className="flex justify-center">
                    <Button
                      color="success"
                      variant="flat"
                      as={Link}
                      href={result.finalFilePath}
                      target="_blank"
                      className="w-full max-w-md mx-auto block"
                    >
                      Stáhnout aktualizovaný soubor
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        );

      case ProcessState.ADVANCED_COMPLETED:
        return (
          <Card className="mt-6">
            <CardHeader>
              <p className="text-lg font-semibold">
                Pokročilé zpracování dokončeno
              </p>
            </CardHeader>
            <CardBody>
              {advancedResult?.reportData && (
                <div className="mt-2 mb-6 border rounded-md p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Výsledky pokročilého zpracování
                  </h3>

                  <div className="space-y-4">
                    {advancedResult.message && (
                      <p className="text-md">{advancedResult.message}</p>
                    )}

                    {advancedResult.reportData.nameComparisonReport && (
                      <div>
                        <h4 className="text-md font-semibold mb-2">
                          Porovnání jmen:
                        </h4>
                        <div
                          className="p-3 mt-2 border rounded-md max-h-48 overflow-auto"
                          dangerouslySetInnerHTML={{
                            __html:
                              advancedResult.reportData.nameComparisonReport,
                          }}
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          Jména byla porovnána mezi listy List1 a List2. V List1
                          byla opravena jména na základě jmen v List2. U
                          opravených jmen je původní hodnota uložena ve sloupci
                          A pro kontrolu.
                        </p>
                      </div>
                    )}

                    {advancedResult.reportData.timeUpdateReport && (
                      <div>
                        <h4 className="text-md font-semibold mb-2">
                          Aktualizace časů:
                        </h4>
                        <div
                          className="p-3 mt-2 border rounded-md  max-h-48 overflow-auto"
                          dangerouslySetInnerHTML={{
                            __html: advancedResult.reportData.timeUpdateReport,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {advancedResult?.outputFile && (
                <div className="p-4  rounded-md ">
                  <p className="font-medium mb-4">
                    Pokročilé zpracování bylo dokončeno! Nyní si můžete stáhnout
                    výsledek:
                  </p>
                  <div className="flex justify-center">
                    <Button
                      color="secondary"
                      variant="bordered"
                      as={Link}
                      href={`/processed/${advancedResult.outputFile}`}
                      target="_blank"
                    >
                      Stáhnout zpracovaný soubor
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        );

      case ProcessState.ERROR:
        return (
          error && (
            <Alert color="danger" className="mt-4">
              {error}
            </Alert>
          )
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Import dat z Avarisu do souboru</h1>

      <Card>
        <CardHeader>
          <p className="text-lg font-semibold">Informace o zpracování</p>
        </CardHeader>
        <CardBody className="mt-0 p-4">
          <ul className="list-disc ml-6 mb-4">
            <li className="pt-1">
              Nahrajte Excel soubor s daty, do kterého chcete importovat data z
              Avarisu
            </li>
            <li className="pt-1">
              Data z Avarisu budou stažena a importována do vašeho souboru
            </li>
            <li className="pt-1">
              Do listu "List2" budou přidána pouze nová data
            </li>
            <li className="pt-1">
              Formátování a vzorce listu "List1" budou zachovány
            </li>
            <li className="pt-1">
              Pro získání pouze čipovacích dat z Avarisu použijte sekci{" "}
              <Link
                href="/avaris/cipovacky"
                className="text-blue-600 underline"
              >
                Čipovačky
              </Link>
            </li>
          </ul>
        </CardBody>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Nahrajte Excel soubor:</h2>
        <DocumentDrop
          onFileUploaded={handleFileUploaded}
          onFileDelete={handleFileDelete}
        />
      </div>

      {uploadedFileName && (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 mt-6">
          <h2 className="text-lg font-semibold">Vyber požadovaný snímač:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex w-full max-w-xs flex-col gap-2">
              <Select
                className="max-w-xs"
                label="Vybraný objekt"
                id="objekty"
                name="objekty"
                placeholder="Vyber objekt"
                selectedKeys={selectedObjects}
                variant="bordered"
                onChange={handleSelectionChange}
              >
                {availableObjects.map((object) => (
                  <SelectItem key={object.key}>{object.label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <h2 className="text-lg font-semibold">Zadej zájmové období:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              className="max-w-xs"
              name="dateFrom"
              variant="bordered"
              label="Datum od"
              id="dateFrom"
              defaultValue={parseDate(
                `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, "0")}-${String(sevenDaysAgo.getDate()).padStart(2, "0")}`
              )}
            />
            <DatePicker
              className="max-w-xs"
              variant="bordered"
              name="dateTo"
              label="Datum do"
              id="dateTo"
              defaultValue={parseDate(
                `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
              )}
            />
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold">Možnosti zpracování:</h3>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="compareNames"
                checked={processingOptions.compareNames}
                onChange={(e) =>
                  setProcessingOptions({
                    ...processingOptions,
                    compareNames: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label htmlFor="compareNames">Porovnání a oprava jmen</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="updateTimes"
                checked={processingOptions.updateTimes}
                onChange={(e) =>
                  setProcessingOptions({
                    ...processingOptions,
                    updateTimes: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label htmlFor="updateTimes">
                Aktualizace časů příchodů a odchodů
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="detectConsecutiveShifts"
                checked={processingOptions.detectConsecutiveShifts}
                onChange={(e) =>
                  setProcessingOptions({
                    ...processingOptions,
                    detectConsecutiveShifts: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label htmlFor="detectConsecutiveShifts">
                Detekce navazujících směn
              </label>
            </div>
          </div>
          <div className="w-full flex justify-center mt-11">
            <Button
              type="submit"
              disabled={
                processState === ProcessState.LOADING ||
                processState === ProcessState.ADVANCED_PROCESSING
              }
              color="primary"
              size="lg"
            >
              {processState === ProcessState.LOADING ? (
                <>
                  <Spinner size="sm" color="current" className="mr-2" />
                  Zpracovávám...
                </>
              ) : (
                "Zpracovat soubor"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Tlačítko pro testování pokročilých funkcí */}
      <div className="mt-4 flex justify-center">
        <Button
          color="secondary"
          onClick={handleRunAdvancedTest}
          disabled={
            processState === ProcessState.LOADING ||
            processState === ProcessState.ADVANCED_PROCESSING
          }
        >
          Testovat pokročilé funkce
        </Button>
      </div>

      {renderContent()}
    </div>
  );
}
