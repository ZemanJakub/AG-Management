"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Card,
  CardBody,
  CardHeader,
} from "@heroui/react";
import { useState } from "react";
import PlusIcon from "@/components/my-icons/plus-icon";
import { toast } from "react-toastify";
import { deleteExcelFile, saveExcelFile } from "@/actions";


interface DocumentDropProps {
  onFileUploaded?: (fileName: string) => void;
  onFileDelete?: (fileName: string) => void;
}

export const DocumentDrop = ({ onFileUploaded, onFileDelete }: DocumentDropProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const saveFiles = async (formData: FormData) => {
    toast.dismiss();
    toast.info("Nahrávám soubor.", {
      autoClose: 8000,
      hideProgressBar: false,
      theme: "dark",
    });
    
    try {
      const result = await saveExcelFile(formData);
      toast.dismiss();
      
      if (result.success && result.fileName) {
        setTimeout(() => {
          toast.success("Soubor byl v pořádku uložen.", {
            autoClose: 2000,
            hideProgressBar: true,
            theme: "dark",
          });
        }, 1000);
        
        // Uložení názvu souboru a volání callback funkce
        setUploadedFileName(result.fileName);
        if (onFileUploaded) {
          onFileUploaded(result.fileName);
        }
      } else {
        toast.warn(`${result.error}`, {
          autoClose: 5000,
          hideProgressBar: true,
          theme: "dark",
        });
      }
    } catch (error) {
      toast.error("Nastala chyba při nahrávání souboru.", {
        autoClose: 5000,
        hideProgressBar: true,
        theme: "dark",
      });
    }
  };

  const handleDeleteFile = async () => {
    if (uploadedFileName) {
      try {
        const result = await deleteExcelFile(uploadedFileName);
        
        if (result.success) {
          setUploadedFileName(null);
          toast.success("Soubor byl odstraněn.", {
            autoClose: 2000,
            hideProgressBar: true,
            theme: "dark",
          });
          
          // Volání callback funkce
          if (onFileDelete) {
            onFileDelete(uploadedFileName);
          }
        } else {
          toast.error(result.error || "Chyba při odstraňování souboru", {
            autoClose: 3000,
            hideProgressBar: true,
            theme: "dark",
          });
        }
      } catch (error) {
        toast.error("Nastala neočekávaná chyba při odstraňování souboru.", {
          autoClose: 3000,
          hideProgressBar: true,
          theme: "dark",
        });
        console.error(error);
      }
    }
  };

  const processFile = async (file: File): Promise<FormData> => {
    toast.info("Zpracovávám soubor.", {
      autoClose: 8000,
      hideProgressBar: false,
      theme: "dark",
    });
    const formData = new FormData();
    formData.append("file", file);
    return formData;
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isOpen ? onOpenChange() : null;
    const files = e.dataTransfer.files;
    
    // Kontrola typu souborů - přijímáme pouze .xlsx
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        toast.error("Pouze soubory Excel (.xlsx) jsou povoleny.", {
          autoClose: 3000,
          hideProgressBar: true,
          theme: "dark",
        });
        return;
      }
    }
    
    // Vezmeme jen první soubor, pokud bylo přetaženo více souborů
    if (files.length > 0) {
      const formToSend = await processFile(files[0]);
      saveFiles(formToSend);
    }
  };

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    isOpen ? onOpenChange() : null;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formToSend = await processFile(file);
      saveFiles(formToSend);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-2">
      {uploadedFileName ? (
        <Card className="max-w-xl">
          <CardHeader>
            <div className="mb-0">Byl nahrán soubor:</div>
          </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between gap-6 pr-2 pb-2">
            <div className="flex-1 flex items-center justify-center h-8 text-md">{uploadedFileName}</div>
            <Button
              size="sm"
              color="danger"
              variant="bordered"
              onPress={handleDeleteFile}
            >
              Odstranit
            </Button>
          </div>
        </CardBody>
      </Card>
      ) : (
        <div>
          <Button
            className="max-w-xl w-64 h-12"
            color="secondary"
            variant="bordered"
            onPress={onOpen}
          >
            <PlusIcon color="secondary"/>
            <div>Nahraj Excel soubor</div> 
          </Button>
          <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Nahrát Excel soubor
                  </ModalHeader>
                  <ModalBody>
                    <div className="flex flex-col justify-center">
                      <div
                        className="w-full h-60 border border-dotted rounded-md grid justify-items-center grid-rows-2 gap-6"
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                      >
                        <div className="relative w-14 h-14 bg-zinc-800 rounded-full self-end flex justify-center items-center hover:bg-zinc-700 hover:cursor-pointer">
                          <form>
                            <input
                              type="file"
                              name="file"
                              id="file"
                              accept=".xlsx"
                              onChange={handleSelectFile}
                              className="top-0 left-0 w-14 h-14 rounded-full absolute cursor-pointer z-20 opacity-0"
                            />
                          </form>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-8 h-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                            />
                          </svg>
                        </div>
                        <h3 className="text-center">
                          Přetáhni Excel soubor (.xlsx) sem, nebo stiskni tlačítko.
                        </h3>
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" variant="light" onPress={onClose}>
                      Zavřít
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
      )}
    </div>
  );
};