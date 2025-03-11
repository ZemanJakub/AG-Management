// modules/avaris/components/excel-merger.tsx
'use client';

import { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Alert } from '@heroui/react';
import { DocumentDrop } from '@/modules/avaris/components/document-drop';
import { copySheet } from '@/actions'; // upravte cestu podle vaší struktury
import { toast } from 'react-toastify';
import Link from 'next/link';

interface SheetCopierProps {
  // Název zdrojového souboru (obvykle filtered.xlsx z Avarisu)
  sourceFile?: string|null;
  // Callback, který se zavolá po úspěšném kopírování
  onProcessed?: (targetFile: string) => void;
}

export const SheetCopier = ({ sourceFile, onProcessed }: SheetCopierProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newSheetName, setNewSheetName] = useState<string | null>(null);

  // Metoda, která se volá, když uživatel nahraje soubor
  const handleFileUploaded = (fileName: string) => {
    setUploadedFile(fileName);
    setProcessedFile(null);
    setError(null);
    setNewSheetName(null);
  };

  // Metoda, která se volá, když uživatel odstraní soubor
  const handleFileDelete = () => {
    setUploadedFile(null);
    setProcessedFile(null);
    setError(null);
    setNewSheetName(null);
  };

  // Metoda pro vytvoření nového listu
  const handleCreateSheet = async () => {
    if (!uploadedFile) {
      toast.error('Nejprve nahrajte Excel soubor');
      return;
    }

    if (!sourceFile) {
      toast.error('Zdrojový soubor s daty není k dispozici');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Vytváříme nový list s daty
      const result = await copySheet(sourceFile, uploadedFile) as any;
      
      if (result.success) {
        toast.success(result.message || 'Nový list byl úspěšně vytvořen');
        setProcessedFile(`/downloads/${uploadedFile}`);
        
        // Uložíme název nového listu, pokud byl vrácen
        if (result.newSheetName) {
          setNewSheetName(result.newSheetName);
        }
        
        if (onProcessed) {
          onProcessed(uploadedFile);
        }
      } else {
        setError(result.error || 'Chyba při vytváření nového listu');
        toast.error(result.error || 'Chyba při vytváření nového listu');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba';
      setError(errorMessage);
      toast.error(`Chyba při zpracování: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <p className="text-lg font-semibold">Přidání dat do Excel souboru</p>
      </CardHeader>
      <CardBody>
        {error && <Alert color="danger" className="mb-4">{error}</Alert>}
        
        <div className="mb-4">
          <p className="mb-8">
            Nahrajte Excel soubor, do kterého chcete přidat data z docházkového systému:
          </p>
          <DocumentDrop
            onFileUploaded={handleFileUploaded}
            onFileDelete={handleFileDelete}
          />
        </div>
        
        {uploadedFile && (
          <div className="mt-4 space-y-4">
            {sourceFile ? (
              <div className="mb-4 p-3 rounded">
                <p className="text-sm">
                  Pro aktualizaci budou použita data ze souboru: <strong>{sourceFile}</strong>
                </p>
              </div>
            ) : (
              <p className="text-red-500 text-sm mt-2 text-center">
                Nejprve musíte získat data z Avarisu
              </p>
            )}
            
            <Button
              color="primary"
              onClick={handleCreateSheet}
              disabled={loading || !sourceFile}
              className="w-full max-w-md mx-auto block"
            >
              {loading ? 'Zpracovávám...' : 'Přidat data do nového listu'}
            </Button>
          </div>
        )}
        
        {processedFile && (
          <div className="mt-4 p-4  rounded-md">
            <p className="font-medium mb-2">
              Data byla úspěšně přidána do vašeho souboru v novém listu{newSheetName ? ` "${newSheetName}"` : ''}!
            </p>
            <div className="mb-4 space-y-2">
              <p className="text-sm">Nyní postupujte podle těchto kroků:</p>
              <ol className="list-decimal ml-5 text-sm">
                <li>Stáhněte si aktualizovaný soubor Excel</li>
                <li>Otevřete soubor v aplikaci Excel</li>
                <li>Všimněte si nového listu{newSheetName ? ` "${newSheetName}"` : ''}, který obsahuje data z Avarisu</li>
                <li>Povolte makra, pokud vás Excel vyzve</li>
                <li>Přejděte na list "List1" a klikněte na tlačítko "Spustit makro"</li>
              </ol>
              <p className="text-sm mt-2 font-medium">Důležité: Neměňte název nového listu, ani ho nepřesouvejte, mohlo by to narušit fungování makra.</p>
            </div>
            <Button
              color="success"
              variant="flat"
              as={Link}
              href={processedFile}
              target="_blank"
              className="w-full max-w-md mx-auto block"
            >
              Stáhnout aktualizovaný soubor
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};