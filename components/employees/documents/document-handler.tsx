"use client";

import { DocumentDisplay } from "./document-display";
import { DocumentProps, EmployeePersonalInformations } from "@/app/lib/models";
import { useState } from "react";
import TrashIcon from "@/components/my-icons/trash-icon";
import { DocumentDrop } from "./document-drop";
import { toast } from "react-toastify";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import useSWR from "swr";
import { fetchDocumentData } from "@/db/queries/employees";

interface DocumentHandlerProps {
  employeeData: EmployeePersonalInformations;
  documentData: DocumentProps[];
  isEditable: boolean;
  id: string;
}

const fetcher = (id: string) => fetchDocumentData(id);

const DeleteConfirmationModal = ({
  isOpen,
  onOpenChange,
  selectedDocumentCount,
  deleteHandler,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  selectedDocumentCount: number;
  deleteHandler: () => void;
}) => (
  <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1 mt-4">{`Mazání souborů`}</ModalHeader>
          <ModalBody>
            {selectedDocumentCount === 1
              ? `Opravdu chcete smazat 1 soubor`
              : `Opravdu chcete smazat ${selectedDocumentCount} soubory?`}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onPress={() => (deleteHandler(), onClose())}>
              Smazat
            </Button>
            <Button color="primary" variant="light" onPress={onClose}>
              Zavřít
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);

export default function DocumentHandler({
  employeeData,
  documentData,
  isEditable,
  id,
}: DocumentHandlerProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDocuments, setSelectedDocuments] = useState<string[] | null>(null);
  const folderId = documentData?.[0]?.folderId;
  const { data: documents = documentData, mutate } = useSWR(folderId ? folderId : null, fetcher, {
    fallbackData: documentData,
  });

  const missingDocuments = documents?.filter((file) => file.status === "draft");
  const validDocuments = documents?.filter((file) => file.status === "published");
  const invalidDocuments = documents?.filter((file) => file.status === "archived");

  const handleSelect = (action: string, id: string) => {
    if (action === "select") {
      setSelectedDocuments((prevState) => (prevState ? [...prevState, id] : [id]));
    } else if (action === "unselect") {
      setSelectedDocuments((prevState) => {
        if (!prevState) return null;
        if (prevState.length === 1 && prevState[0] === id) return null;
        return prevState.filter((item) => item !== id);
      });
    }
  };

  const deleteHandler = async () => {
    toast.info("Mažu soubory.", {
      autoClose: 8000,
      hideProgressBar: false,
      theme: "dark",
    });

    if (selectedDocuments) {
      try {
        const result = await fetch(`/api/deleteFiles`, {
          method: "POST",
          body: JSON.stringify({ id: selectedDocuments }),
        });

        toast.dismiss();

        if (result.ok) {
          toast.success("Soubory byly v pořádku smazány.", {
            autoClose: 2000,
            hideProgressBar: true,
            theme: "dark",
          });
          await mutate(); // Ensure mutate is awaited
          setSelectedDocuments(null);
        } else {
          const text = await result.text();
          toast.warn(`Chyba serveru: ${text}`, {
            autoClose: 5000,
            hideProgressBar: true,
            theme: "dark",
          });
        }
      } catch (error) {
        toast.dismiss();
        toast.error("Došlo k chybě při mazání souborů. Zkontrolujte své připojení k internetu a zkuste to znovu.", {
          autoClose: 5000,
          hideProgressBar: true,
          theme: "dark",
        });
      }
    }
  };

  return (
    <div className="w-full flex flex-col">
      {isEditable && (
        <div className="w-full flex mb-4">
          <DocumentDrop
            id={id}
            firstName={employeeData.firstName}
            secondName={employeeData.secondName}
            onDocumentChange={mutate}
          />
          <Button
            isIconOnly
            variant="bordered"
            className="border-indigo-500 ml-2"
            onPress={onOpenChange}
          >
            <TrashIcon color="indigo-500" />
          </Button>
          <DeleteConfirmationModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            selectedDocumentCount={selectedDocuments?.length || 0}
            deleteHandler={deleteHandler}
          />
        </div>
      )}

      {(!missingDocuments||missingDocuments.length===0) && (!validDocuments||validDocuments.length===0)&&  (!invalidDocuments||invalidDocuments.length===0) && (
        <div className="">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-16 mt-10 text-center md:text-start">
            Nejsou nahrány žádné dokumety
          </h2>
        </div>
      )}

      {missingDocuments && missingDocuments.length > 0 && (
        <div className="">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 text-center md:text-start">
            Nezařazené dokumenty
          </h2>
          <div className="max-w-full mx-auto p-4">
            <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start ">
              {missingDocuments?.map((file) => (
                <DocumentDisplay
                  id={id}
                  key={file.id}
                  file={file}
                  isEditable={isEditable}
                  firstName={employeeData.firstName}
                  secondName={employeeData.secondName}
                  sendIsSelected={handleSelect}
                  onDocumentChange={mutate}
                  onDocumentDelete={onOpenChange}
                  mutateDocuments={mutate}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {validDocuments && validDocuments.length > 0 && (
        <div className="">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 text-center md:text-start">
            Platné dokumenty
          </h2>
          <div className="max-w-full mx-auto p-4">
            <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start ">
              {validDocuments?.map((file) => (
                <DocumentDisplay
                  id={id}
                  key={file.id}
                  file={file}
                  isEditable={isEditable}
                  firstName={employeeData.firstName}
                  secondName={employeeData.secondName}
                  sendIsSelected={handleSelect}
                  onDocumentChange={mutate}
                  onDocumentDelete={onOpenChange}
                  mutateDocuments={mutate}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {invalidDocuments && invalidDocuments.length > 0 && (
        <div className="">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 text-center md:text-start">
            Neplatné dokumenty
          </h2>
          <div className="max-w-full mx-auto p-4">
            <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start ">
              {invalidDocuments?.map((file) => (
                <DocumentDisplay
                  id={id}
                  key={file.id}
                  file={file}
                  isEditable={isEditable}
                  firstName={employeeData.firstName}
                  secondName={employeeData.secondName}
                  sendIsSelected={handleSelect}
                  onDocumentChange={mutate}
                  onDocumentDelete={onOpenChange}
                  mutateDocuments={mutate}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
