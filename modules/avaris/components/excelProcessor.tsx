// modules/avaris/components/excel-processor.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Alert, Tabs, Tab, Spinner } from '@heroui/react';
import { DocumentDrop } from '@/modules/avaris/components/document-drop';
import { processExcelFile, processNameComparison, processTimeUpdate, getExcelReport } from '@/actions';
import Link from 'next/link';

export const ExcelProcessor = () => {
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportHtml, setReportHtml] = useState<{ nameReport?: string, timeReport?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'names' | 'times'>('all');
  const [previewMode, setPreviewMode] = useState(false);

  // Reference na formulář pro přímé odeslání souboru
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metoda, která se volá, když uživatel nahraje soubor
  const handleFileUploaded = async (fileName: string) => {
    setUploadedFileName(fileName);
    setProcessedFile(null);
    setError(null);
    setReportHtml(null);
    
    // Zde je klíčová změna - budeme chtít získat přístup k souboru z veřejné složky
    try {
      // Vytvoříme input element a nastavíme jeho hodnotu
      if (fileInputRef.current) {
        fileInputRef.current.value = fileName;
      }
    } catch (error) {
      console.error("Chyba při nastavování souboru:", error);
    }
  };

  // Metoda, která se volá, když uživatel odstraní soubor
  const handleFileDelete = () => {
    setUploadedFileName(null);
    setProcessedFile(null);
    setError(null);
    setReportHtml(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Metoda pro zpracování souboru
  const handleProcessFile = async () => {
    if (!uploadedFileName) {
      setError('Nejprve nahrajte Excel soubor');
      return;
    }

    setLoading(true);
    setError(null);
    setReportHtml(null);

    try {
      if (!formRef.current) return;
      
      // Místo použití FormData z formuláře, vytvoříme nový FormData objekt s nahraným souborem
      const formData = new FormData();
      
      // Nejprve potřebujeme získat soubor ze složky public/downloads
      try {
        const response = await fetch(`/downloads/${uploadedFileName}`);
        
        if (!response.ok) {
          throw new Error(`Nepodařilo se načíst soubor: ${response.statusText}`);
        }
        
        const fileBlob = await response.blob();
        const file = new File([fileBlob], uploadedFileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Přidáme soubor do FormData
        formData.append('file', file);
        
        // Nyní můžeme pokračovat se zpracováním
        let result;
        
        if (previewMode) {
          // Pouze náhled reportu bez uložení souboru
          result = await getExcelReport(formData);
        } else {
          // Zpracování podle vybrané záložky
          switch (activeTab) {
            case 'names':
              result = await processNameComparison(formData);
              break;
            case 'times':
              result = await processTimeUpdate(formData);
              break;
            case 'all':
            default:
              result = await processExcelFile(formData);
              break;
          }
        }

        if (result.success) {
          if (!previewMode && result.filePath) {
            setProcessedFile(result.filePath);
          }
          
          // Nastavení HTML reportu pro náhled
          setReportHtml({
            nameReport: result.nameReport,
            timeReport: result.timeReport
          });
        } else {
          setError(result.error || 'Chyba při zpracování souboru');
        }
      } catch (error) {
        throw new Error(`Chyba při načítání souboru: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <h2 className="text-lg font-semibold">Zpracování Excel souboru</h2>
        <p className="text-sm text-gray-600">
          Nahrajte Excel soubor s listy List1 a List2 pro náhradu funkcí původních maker
        </p>
      </CardHeader>
      <CardBody>
        {error && <Alert color="danger" className="mb-4">{error}</Alert>}
        
        <div className="mb-4">
          <p className="mb-4">
            Nahrajte Excel soubor, který chcete zpracovat:
          </p>
          
          <form ref={formRef}>
            <DocumentDrop
              onFileUploaded={handleFileUploaded}
              onFileDelete={handleFileDelete}
            />
            
            {/* Skrytý input pro čtení souboru ve formuláři */}
            <input 
              type="hidden" 
              name="fileName" 
              ref={fileInputRef}
              value={uploadedFileName || ''} 
            />
          </form>
        </div>
        
        {uploadedFileName && (
          <div className="mt-6 space-y-4">
            <Tabs 
              aria-label="Options" 
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as 'all' | 'names' | 'times')}
              color="primary"
              variant="bordered"
            >
              <Tab key="all" title="Kompletní zpracování">
                <div className="p-4">
                  <p>
                    Tato volba provede kompletní zpracování souboru - porovnání jmen i aktualizaci časů.
                  </p>
                </div>
              </Tab>
              <Tab key="names" title="Jen porovnání jmen">
                <div className="p-4">
                  <p>
                    Tato volba provede pouze porovnání a korekci jmen mezi listy List1 a List2.
                  </p>
                </div>
              </Tab>
              <Tab key="times" title="Jen aktualizace časů">
                <div className="p-4">
                  <p>
                    Tato volba provede pouze aktualizaci skutečných časů příchodů a odchodů.
                  </p>
                </div>
              </Tab>
            </Tabs>
            
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="previewMode"
                checked={previewMode}
                onChange={(e) => setPreviewMode(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="previewMode">
                Pouze náhled reportu (bez uložení souboru)
              </label>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button
                color="primary"
                onClick={handleProcessFile}
                disabled={loading}
                className="w-full max-w-md"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" color="current" className="mr-2" />
                    Zpracovávám...
                  </>
                ) : (
                  <>Zpracovat soubor</>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Náhled reportu */}
        {reportHtml && (reportHtml.nameReport || reportHtml.timeReport) && (
          <div className="mt-6 border rounded-md p-4">
            <h3 className="text-lg font-semibold mb-4">Náhled reportu</h3>
            
            <Tabs aria-label="Report tabs">
              {reportHtml.nameReport && (
                <Tab key="nameReport" title="Report jmen">
                  <div 
                    className="p-4 overflow-auto max-h-96" 
                    dangerouslySetInnerHTML={{ __html: reportHtml.nameReport }} 
                  />
                </Tab>
              )}
              
              {reportHtml.timeReport && (
                <Tab key="timeReport" title="Report časů">
                  <div 
                    className="p-4 overflow-auto max-h-96" 
                    dangerouslySetInnerHTML={{ __html: reportHtml.timeReport }} 
                  />
                </Tab>
              )}
            </Tabs>
          </div>
        )}
        
        {/* Odkaz na stažení zpracovaného souboru */}
        {processedFile && !previewMode && (
          <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-md">
            <p className="font-medium mb-2">
              Soubor byl úspěšně zpracován!
            </p>
            <div className="flex justify-center">
              <Button
                color="success"
                variant="flat"
                as={Link}
                href={processedFile}
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
};