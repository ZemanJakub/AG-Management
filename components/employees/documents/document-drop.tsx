"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import PlusIcon from "@/components/my-icons/plus-icon";
import { handleFileConvert } from "../../helpers/frontEndImageResize";
import { toast } from "react-toastify";

interface DocumentDisplayProps {
  id: string;
  firstName: string;
  secondName: string;
  onDocumentChange: () => void;
}

const saveFiles = async (formData: FormData,onDocumentChange: () => void) => {
  toast.dismiss();
  toast.info("Nahrávám soubory.", {
    autoClose: 8000,
    hideProgressBar: false,
    theme: "dark",
  });
  const result = await fetch("/api/saveFiles", {
    method: "POST",
    body: formData,
  });
  toast.dismiss();
  if (result.status === 200) {
    setTimeout(() => {
      toast.success("Soubory byly v pořádku uloženy.", {
        autoClose: 2000,
        hideProgressBar: true,
        theme: "dark",
      });
    }, 1000);
    onDocumentChange()
  } else {
    const text = await result.text();
    toast.warn(`${text}`, {
      autoClose: 5000,
      hideProgressBar: true,
      theme: "dark",
    });
  }
  
};

const processFilesAndCreateForm = async (
  files: FileList,
  id: string
): Promise<FormData> => {
  toast.info("Zpracovávám soubory.", {
    autoClose: 8000,
    hideProgressBar: false,
    theme: "dark",
  });
  const formData = new FormData();
  formData.append("id", id);
  for (const file of Array.from(files)) {
    const isHeicOrHeif =
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    if (isHeicOrHeif) {
      const convertedBlob = await handleFileConvert(file);
      const convertedArrayBuffer = await (convertedBlob as Blob).arrayBuffer();
      const convertedFile = new File(
        [convertedArrayBuffer],
        file.name.replace(/\.(heic|heif)$/i, ".jpg"),
        {
          type: "image/jpeg",
        }
      );
      formData.append("file", convertedFile);
    } else {
      formData.append("file", file);
    }
  }
  return formData;
};

export const DocumentDrop = ({ id,onDocumentChange }: DocumentDisplayProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isOpen ? onOpenChange() : null;
    const files = e.dataTransfer.files;
    const formToSend = await processFilesAndCreateForm(files, id);
    saveFiles(formToSend,onDocumentChange);
  };

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    isOpen ? onOpenChange() : null;
    if (e.target.files ) {
      const files = e.target.files;
      const formToSend = await processFilesAndCreateForm(files, id);
      saveFiles(formToSend,onDocumentChange);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <>
        <div>
          <Button
            color="secondary"
            variant="bordered"
            onClick={onOpen}
            isIconOnly 
            className="border-indigo-500"
          >
           <PlusIcon color="indigo-500"/>
          </Button>
        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Nahrát soubor
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col justify-center">
                    <div
                      className="w-full h-60 border border-dotted rounded-md grid justify-items-center  grid-rows-2 gap-6"
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
                            accept="*/*"
                            multiple
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
                        Přetáhni soubory sem, nebo stiskni tlačítko.
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
      </>
    </div>
  );
};
