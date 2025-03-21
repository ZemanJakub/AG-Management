// modules/admin/components/logWiewer.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Button, Spinner } from "@heroui/react";
import {
  getLogFiles,
  getLogFileContent,
  setLogLevel,
  getLogFileBase64,
} from "@/actions";

/**
 * Komponenta pro zobrazení logů z adresáře logs
 */
export default function LogViewer() {
  const [logFiles, setLogFiles] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<string>("");
  const [logContent, setLogContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLogLevel, setCurrentLogLevel] = useState<string>("info");

  // Načtení seznamu log souborů
  useEffect(() => {
    const fetchLogList = async () => {
      try {
        setLoading(true);
        const result = await getLogFiles();
        if (result.success) {
          setLogFiles(result.files || []);
          if (result.files && result.files.length > 0) {
            setSelectedLog(result.files[0]);
          }
        } else {
          setError(result.error || "Nepodařilo se načíst seznam logů");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Nepodařilo se načíst seznam logů"
        );
        console.error("Chyba při načítání seznamu logů:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogList();
  }, []);

  // Načtení obsahu vybraného logu
  useEffect(() => {
    const fetchLogContent = async () => {
      if (!selectedLog) return;

      try {
        setLoading(true);
        const result = await getLogFileContent(selectedLog);
        if (result.success) {
          setLogContent(result.content || "Log je prázdný");
          setError(null);
        } else {
          setError(result.error || "Nepodařilo se načíst obsah logu");
          setLogContent("");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Nepodařilo se načíst obsah logu"
        );
        console.error("Chyba při načítání obsahu logu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogContent();
  }, [selectedLog]);

  // Obsluha změny vybraného logu
  const handleLogChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLog(e.target.value);
  };

  // Obsluha stažení logu
  const handleDownload = async () => {
    if (!selectedLog) return;

    try {
      setLoading(true);

      // Získání obsahu souboru v Base64
      const result = await getLogFileBase64(selectedLog);

      if (!result.success) {
        setError(result.error || "Nepodařilo se stáhnout log soubor");
        return;
      }

      // Bezpečnostní kontrola, že máme všechny potřebné údaje
      if (!result.base64Content || !result.filename) {
        setError("Chybí potřebná data pro stažení souboru");
        return;
      }

      // Dekódování Base64 a vytvoření Blob
      const byteCharacters = atob(result.base64Content);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, {
        type: result.contentType || "text/plain",
      });

      // Vytvoření URL a stažení souboru
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();

      // Čištění
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nepodařilo se stáhnout log soubor"
      );
      console.error("Chyba při stahování logu:", err);
    } finally {
      setLoading(false);
    }
  };

  // Obsluha aktualizace seznamu logů
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const logListResult = await getLogFiles();

      if (logListResult.success) {
        setLogFiles(logListResult.files || []);

        // Pokud je vybraný log, aktualizujeme jeho obsah
        if (selectedLog) {
          const logContentResult = await getLogFileContent(selectedLog);
          if (logContentResult.success) {
            setLogContent(logContentResult.content || "Log je prázdný");
            setError(null);
          } else {
            setError(
              logContentResult.error || "Nepodařilo se načíst obsah logu"
            );
          }
        }
      } else {
        setError(
          logListResult.error || "Nepodařilo se aktualizovat seznam logů"
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nepodařilo se aktualizovat data"
      );
      console.error("Chyba při aktualizaci dat:", err);
    } finally {
      setLoading(false);
    }
  };

  // Obsluha změny úrovně logování
  const handleLogLevelChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLevel = e.target.value;
    try {
      const result = await setLogLevel(newLevel);
      if (result.success) {
        setCurrentLogLevel(newLevel);
        setError(null);
      } else {
        setError(result.error || "Nepodařilo se změnit úroveň logování");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nepodařilo se změnit úroveň logování"
      );
      console.error("Chyba při změně úrovně logování:", err);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:justify-between items-center">
        <h2 className="text-xl font-bold">Prohlížeč logů</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="logLevel" className="text-sm">
              Úroveň logování:
            </label>
            <select
              id="logLevel"
              value={currentLogLevel}
              onChange={handleLogLevelChange}
              className="text-sm border rounded px-2 py-1 bg-transparent"
              style={{ backgroundColor: "transparent" }}
              disabled={loading}
            >
              <option value="error" style={{ backgroundColor: "inherit" }}>
                Error
              </option>
              <option value="warn" style={{ backgroundColor: "inherit" }}>
                Warn
              </option>
              <option value="info" style={{ backgroundColor: "inherit" }}>
                Info
              </option>
              <option value="debug" style={{ backgroundColor: "inherit" }}>
                Debug
              </option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              onPress={handleRefresh}
              isDisabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Aktualizovat"}
            </Button>
            <Button
              size="sm"
              color="secondary"
              onPress={handleDownload}
              isDisabled={!selectedLog || loading}
            >
              Stáhnout
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {error && <div className="text-red-500 mb-4">Chyba: {error}</div>}

        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <label htmlFor="logFile" className="block mb-2">
              Vyberte log soubor:
            </label>
            <select
              id="logFile"
              value={selectedLog}
              onChange={handleLogChange}
              disabled={loading || logFiles.length === 0}
              className="w-full border rounded p-2 mb-4 bg-transparent"
            >
              {logFiles.map((file) => (
                <option key={file} value={file}>
                  {file}
                </option>
              ))}
            </select>

            {logFiles.length === 0 && !loading && (
              <div className="text-gray-500 text-center my-4">
                Žádné log soubory nenalezeny
              </div>
            )}
          </div>

          <div className="w-full md:w-2/3">
            <div className="border rounded-md p-2 bg-gray-50 h-[500px] overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Spinner size="lg" />
                </div>
              ) : (
                <pre className="text-xs whitespace-pre-wrap">{logContent}</pre>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
