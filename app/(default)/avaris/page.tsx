// app/avaris/page.tsx
"use client";

import { useState, useRef, FormEvent } from "react";
import Link from "next/link";
import { processAvarisRequest } from "@/actions/avaris/avaris";
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
import { Input } from "@heroui/react";
import { Card } from "@heroui/react";
import { Alert } from "@heroui/react";
import { parseDate } from "@internationalized/date";

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
  { key: "SVJ NA CÍSAŘCE", label: "SVJ NA CÍSAŘCE" },
  { key: "SVJ NA HŘEBENKÁCH", label: "SVJ NA HŘEBENKÁCH" },
  { key: " NA LOVU", label: " NA LOVU" },
 
];
// Definice stavů zpracování
enum ProcessState {
    INITIAL = "INITIAL",           // Počáteční stav
    LOADING = "LOADING",           // Načítání dat
    DATA_LOADED = "DATA_LOADED",   // Data z Avarisu načtena
    PROCESSED = "PROCESSED",       // Soubor byl úspěšně zpracován
    ERROR = "ERROR"                // Došlo k chybě
  }
  
  export default function AvarisPage() {
    // Stavové proměnné
    const [processState, setProcessState] = useState<ProcessState>(ProcessState.INITIAL);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0); // Pro progress bar
    const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set([]));
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [reportTab, setReportTab] = useState<string>("name"); // Pro záložky reportu
    
    // Reference na formulář
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Formátování data
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
  
    // Změna vybraných objektů
    const handleSelectionChange = (e: any) => {
      const values = e.target.value.split(",");
      setSelectedObjects(new Set(values));
    };
    
    // Zpracování nahrání souboru
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setUploadedFile(e.target.files[0]);
      }
    };
    
    // Zpracování formuláře
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      
      // Reset stavů
      setProcessState(ProcessState.LOADING);
      setError(null);
      setResult(null);
      setProgress(0);
      
      try {
        const formData = new FormData(e.currentTarget);
        
        // Přidáme nahraný soubor do FormData, pokud existuje
        if (uploadedFile) {
          formData.append("file", uploadedFile);
        }
        
        // Simulace progress baru (reálně nemáme zpětnou vazbu o pokroku)
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + (5 * Math.random());
            return newProgress > 90 ? 90 : newProgress;
          });
        }, 500);
        
        // Zavoláme naši optimalizovanou serverovou akci
        const response = await processAvarisRequest(formData);
        
        clearInterval(progressInterval);
        setProgress(100);
        
        console.log("Response from processAvarisRequest:", response);
        
        if (response.success) {
          setResult(response);
          
          // Nastavení správného stavu dle výsledku
          if (response.finalFilePath) {
            setProcessState(ProcessState.PROCESSED);
          } else if (response.processedData) {
            setProcessState(ProcessState.DATA_LOADED);
          }
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
                  <p className="text-lg mb-4">Probíhá získávání a zpracování dat...</p>
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
          
        case ProcessState.DATA_LOADED:
          return (
            <Card className="mt-6">
              <CardHeader>
                <p className="text-lg font-semibold">
                  Export dokončen {result.timestamp && new Date(result.timestamp).toLocaleString("cs")}
                </p>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-4 mt-4">
                  {result.processedData && Object.entries(result.processedData).map(
                    ([objektName, data]: [string, any]) =>
                      data.success &&
                      data.xlsxFilePath && (
                        <Card key={objektName} className="mb-4 min-w-72 max-w-96">
                          <CardBody>
                            <p className="text-lg font-semibold pb-2">
                              {objektName}
                            </p>
                            <p className="text-sm text-gray-600 pb-3">
                              Nalezeno {data.data?.length || 0} záznamů z{" "}
                              {data.summary?.totalRecords}
                            </p>
                            <Button
                              color="success"
                              variant="flat"
                              as={Link}
                              href={data.xlsxFilePath}
                            >
                              Stáhnout CSV soubor
                            </Button>
                          </CardBody>
                        </Card>
                      )
                  )}
                </div>
                
                {!uploadedFile && (
                  <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-md">
                    <p className="mb-4">Pro další zpracování a analýzu dat nahrajte svůj Excel soubor:</p>
                    <div className="flex items-center justify-center">
                      <input
                        type="file"
                        id="excelFile"
                        ref={fileInputRef}
                        accept=".xlsx"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button
                        color="primary"
                        onPress={() => fileInputRef.current?.click()}
                      >
                        Nahrát Excel soubor
                      </Button>
                    </div>
                  </div>
                )}
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
                {result.reportData && (result.reportData.nameReport || result.reportData.timeReport) && (
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
                
                {result.finalFilePath && (
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
        <h1 className="text-2xl font-bold">Data z portálu Avaris</h1>
        
        <Card>
          <CardHeader>
            <p className="text-lg font-semibold">Informace o zpracování</p>
          </CardHeader>
          <CardBody className="mt-0 p-4">
            <ul className="list-disc ml-6 mb-4">
              <li className="pt-1">
                Filtruje záznamy s příznakem <strong>ST</strong>
              </li>
              <li className="pt-1">Data z Avaris budou stažena a zpracována</li>
              <li className="pt-1">Pokud nahrajete Excel soubor, data budou automaticky integrována</li>
              <li className="pt-1">Systém provede kontrolu jmen a aktualizaci časů</li>
            </ul>
          </CardBody>
        </Card>
  
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
                selectionMode="multiple"
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
          
          <h2 className="text-lg font-semibold">Soubor pro zpracování (volitelné):</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center">
              <input
                type="file"
                id="excelFile"
                ref={fileInputRef}
                accept=".xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                color="secondary"
                variant="bordered"
                onPress={() => fileInputRef.current?.click()}
                className="mr-4"
              >
                Vybrat Excel soubor
              </Button>
              {uploadedFile && (
                <div className="flex items-center">
                  <span className="text-sm truncate max-w-xs">{uploadedFile.name}</span>
                  <Button
                    color="danger"
                    variant="light"
                    size="sm"
                    className="ml-2"
                    onPress={() => setUploadedFile(null)}
                  >
                    Zrušit
                  </Button>
                </div>
              )}
            </div>
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
                "Získat a zpracovat data"
              )}
            </Button>
          </div>
        </form>
  
        {renderContent()}
      </div>
    );
  }