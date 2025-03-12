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
  Tabs,
  Tab,
  Spinner,
} from "@heroui/react";
import { Card } from "@heroui/react";
import { Alert } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { DocumentDrop } from '@/modules/podklady/components/document-drop';
import { processAvarisWithExcel } from "@/actions/podklady/processAvarisWithExcel";

// Předdefinované objekty pro výběr - stejné jako v cipovacky
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
  { key: "SVJ NA CÍSAŘCE", label: "SVJ NA CÍSAŘCE" },
  { key: "SVJ NA HŘEBENKÁCH", label: "SVJ NA HŘEBENKÁCH" },
  { key: "NA LOVU", label: "NA LOVU" },
];

// Definice stavů zpracování
enum ProcessState {
  INITIAL = "INITIAL",           // Počáteční stav
  LOADING = "LOADING",           // Načítání dat
  PROCESSED = "PROCESSED",       // Soubor byl úspěšně zpracován
  ERROR = "ERROR"                // Došlo k chybě
}

export default function PodkladyPage() {
  // Stavové proměnné
  const [processState, setProcessState] = useState<ProcessState>(ProcessState.INITIAL);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0); // Pro progress bar
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set([]));
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [reportTab, setReportTab] = useState<string>("name"); // Pro záložky reportu
  
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
  
  // Zpracování formuláře - zde budeme implementovat případ 1
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Reset stavů
    setProcessState(ProcessState.LOADING);
    setError(null);
    setResult(null);
    setProgress(0);
    
    if (!uploadedFileName) {
      setError("Nejprve nahrajte Excel soubor");
      setProcessState(ProcessState.ERROR);
      return;
    }
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("fileName", uploadedFileName);
      
      // Simulace progress baru
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (5 * Math.random());
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      // Zde zavoláme novou serverovou akci pro případ 1 (implementace bude následovat)
      // const response = await processAvarisWithExcel(formData);
      
      // Dočasně simulujeme čekání na implementaci
      await new Promise(resolve => setTimeout(resolve, 2000));
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
        
      case ProcessState.PROCESSED:
        return (
          <Card className="mt-6">
            <CardHeader>
              <p className="text-lg font-semibold">
                Zpracování dokončeno
              </p>
            </CardHeader>
            <CardBody>
              {result?.reportData && (result.reportData.nameReport || result.reportData.timeReport) && (
                <div className="mt-2 mb-6 border rounded-md p-4">
                  <h3 className="text-lg font-semibold mb-4">Výsledky zpracování</h3>
                  
                  <Tabs 
                    aria-label="Report tabs" 
                    selectedKey={reportTab} 
                    onSelectionChange={(key) => setReportTab(key as string)}
                  >
                    {result.reportData.nameReport && (
                      <Tab key="name" title="Report jmen">
                        <div 
                          className="p-4 overflow-auto max-h-96" 
                          dangerouslySetInnerHTML={{ __html: result.reportData.nameReport }} 
                        />
                      </Tab>
                    )}
                    
                    {result.reportData.timeReport && (
                      <Tab key="time" title="Report časů">
                        <div 
                          className="p-4 overflow-auto max-h-96" 
                          dangerouslySetInnerHTML={{ __html: result.reportData.timeReport }} 
                        />
                      </Tab>
                    )}
                  </Tabs>
                </div>
              )}
              
              {result?.finalFilePath && (
                <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                  <p className="font-medium mb-4">
                    Soubor byl úspěšně zpracován! Nyní si můžete stáhnout kompletní výsledek:
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
                      Stáhnout zpracovaný soubor
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        );
        
      case ProcessState.ERROR:
        return error && (
          <Alert color="danger" className="mt-4">
            {error}
          </Alert>
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
              Nahrajte Excel soubor s daty, do kterého chcete importovat data z Avarisu
            </li>
            <li className="pt-1">Data z Avarisu budou stažena a importována do vašeho souboru</li>
            <li className="pt-1">Systém provede kontrolu jmen a aktualizaci časů</li>
            <li className="pt-1">Pro získání pouze čipovacích dat z Avarisu použijte sekci <Link href="/avaris/cipovacky" className="text-blue-600 underline">Čipovačky</Link></li>
          </ul>
        </CardBody>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">
          Nahrajte Excel soubor:
        </h2>
        <DocumentDrop
          onFileUploaded={handleFileUploaded}
          onFileDelete={handleFileDelete}
        />
      </div>

      {uploadedFileName && (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 mt-6">
          <h2 className="text-lg font-semibold">
            Vyber požadovaný snímač:
          </h2>
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
              defaultValue={parseDate(`${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`)}
            />
            <DatePicker
              className="max-w-xs"
              variant="bordered"
              name="dateTo"
              label="Datum do"
              id="dateTo"
              defaultValue={parseDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)}
            />
          </div>
          
          <div className="w-full flex justify-center mt-11">
            <Button
              type="submit"
              disabled={processState === ProcessState.LOADING}
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

      {renderContent()}
    </div>
  );
}