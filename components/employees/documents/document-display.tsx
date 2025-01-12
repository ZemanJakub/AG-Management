"use client";

import Icon02 from "@/public/images/icon-02.svg";
import PdfIcon from "@/public/images/pdf-icon.png";
import ExcelIcon from "@/public/images/excel-icon.png";
import WordIcon from "@/public/images/word-icon.png";
import ToUpload from "@/public/images/nan-icon.png";
import NaNIcon from "@/public/images/unknownFile-icon.png";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import Image from "next/image";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { DocumentProps } from "@/app/lib/models";
import CheckCircleIcon from "@/components/my-icons/check-circle-icon";
import CircleIcon from "@/components/my-icons/circle-icon";
import DocumentInfoUpdate from "./document-info-update";

interface DocumentDisplayProps {
  file: DocumentProps;
  isEditable: boolean;
  firstName: string;
  secondName: string;
  id: string;
  sendIsSelected: (action: string, id: string) => void;
  onDocumentChange: () => void;
  onDocumentDelete: () => void;
  mutateDocuments: () => void;
}

export const DocumentDisplay = (props: DocumentDisplayProps) => {
  const { file, isEditable, firstName, secondName, sendIsSelected } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [updateDocument, setUpdateDocument] = useState<boolean>(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  let documentInfoContent: DocumentProps = {
    date_created: file.date_created,
    documentId: file.documentId,
    folderId: file.folderId,
    holderId: props.id,
    id: file.id,
    name: file.name,
    type: file.type,
    status: file.status,
    url: file.url,
    validFrom: file.validFrom,
    validTo: file.validTo,
    documentType: file.documentType,
    contractType: file.contractType,
  };

  const closeDocumentUpdate = () => {
    setUpdateDocument((prevValue) => !prevValue);
  };
  const replaceHandler = () => {
    if (!file.validFrom) {
      // logika pro vytvoreni zaznamu o dokumentu
    } else {
      // logika pro aktualizaci zaznamu o dokumentu
    }

    setIsMenuOpen(false);
  };
  const endHandler = () => {
    props.onDocumentChange();
    setIsMenuOpen(false);
  };

  const downloadFileHandler = (url: string, type: string) => {
    const link = document.createElement("a");
    link.href = `${url}?download`;
    link.setAttribute("download", `${firstName} ${secondName} ${file.name}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    props.onDocumentChange();
    setIsMenuOpen(false);
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "published":
        return "border-green-500";
      case "archived":
        return "border-red-500";
      case "draft":
        return "border-orange-500";
      default:
        return "border-gray-500";
    }
  };

  const getIcon = (type: string | undefined, url: string | undefined) => {
    if (type && (type.includes("sheet") || type.includes("excel"))) {
      return ExcelIcon;
    } else if (type && type.includes("pdf")) {
      return PdfIcon;
    } else if (type && type.includes("image")) {
      return url ? url : Icon02;
    } else if (type && type.includes("word")) {
      return WordIcon;
    } else {
      return NaNIcon;
    }
  };

  const selectHandler = () => {
    setIsSelected((prevState) => !prevState);
    const action = isSelected ? "unselect" : "select";
    sendIsSelected(action, file.id);
  };

  const splitIndex = file.name.search(/\d/);
  const name = file.name.substring(0, splitIndex).trim();
  const validity = file.name.substring(splitIndex).trim();

  return (
    <div className="group flex justify-center items-center">
      {!isMenuOpen && (
        <div
          key={file.id}
          className={`bg-white dark:bg-slate-800 w-36 h-56 border ${
            isSelected
              ? "border-indigo-500 border-3"
              : "border-slate-200 dark:border-slate-700"
          } rounded-md shadow-sm relative`}
        >
          <div className="flex items-center justify-between absolute w-full h-7">
            {/* <Popover placement="right">
              <PopoverTrigger>
                <Button
                  className=" z-30 w-5 h-7  rounded-full flex justify-center items-center cursor-pointer m-1 italic text-sm text-center font-serif text-white hover:bg-transparent before:bg-transparent after:bg-transparent"
                  isIconOnly
                  color="default"
                  aria-label="Like"
                  size="sm"
                  radius="full"
                  variant="light"
                >
                  <p className="pb-1 pr-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                      />
                    </svg>
                  </p>
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="text-md text-white font-bold text-center pt-3">
                  Detail dokumentu
                </div>
                <div className="px-1 py-4 pt-2">
                  <table>
                    <tbody>
                      <tr>
                        <td>Jméno:</td>
                        <td className="pl-2">{firstName}</td>
                      </tr>
                      <tr>
                        <td>Příjmení:</td>
                        <td className="pl-2">{secondName}</td>
                      </tr>
                      <tr>
                        <td>Název:</td>
                        <td className="pl-2">{file.name}</td>
                      </tr>
                      <tr>
                        <td>Status:</td>
                        <td className="pl-2">
                          {(file.status === "published" && "Platný") ||
                            (file.status === "draft" && "Nezařazený") ||
                            (file.status === "archived" && "Neplatný")}
                        </td>
                      </tr>
                      <tr>
                        <td>Uložen dne:</td>
                        <td className="pl-2">
                          {new Date(file.date_created).toLocaleDateString()}
                        </td>
                      </tr>
                      <tr>
                        <td>Uložil:</td>
                        <td className="pl-2">{file.created_by}</td>
                      </tr>
                      <tr>
                        <td>Platný od:</td>
                        <td className="pl-2">
                          {file.validFrom
                            ? new Date(file.validFrom).toLocaleDateString()
                            : "NaN"}
                        </td>
                      </tr>
                      <tr>
                        <td>Platný do:</td>
                        <td className="pl-2">
                          {file.validTo
                            ? new Date(file.validTo).toLocaleDateString()
                            : "bez omezení"}
                        </td>
                      </tr>
                      {file.updated_by && (
                        <tr>
                          <td>Změnu provedl:</td>
                          <td className="pl-2">{file.updated_by}</td>
                        </tr>
                      )}
                      {file.date_updated && (
                        <tr>
                          <td>Změněn dne:</td>
                          <td className="pl-2">
                            {new Date(file.date_updated).toLocaleDateString()}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </PopoverContent>
            </Popover> */}

            {isEditable && (
              <div
                className="w-10 h-6 z-30 cursor-pointer p-1"
                onClick={selectHandler}
              >
                <p className="">
                  {isSelected ? (
                    <CheckCircleIcon color="indigo-500 z-30" />
                  ) : (
                    <CircleIcon color="white z-30 hidden group-hover:block" />
                  )}
                </p>
              </div>
            )}
            {isEditable && (
              <div
                onClick={() => setIsMenuOpen(true)}
                className="z-30 w-8 h-4 pt-2 rounded-md flex justify-center items-center cursor-pointer m-1"
              >
                <svg className="w-8 h-8 fill-current" viewBox="0 5 32 32">
                  <circle cx="16" cy="16" r="2" />
                  <circle cx="10" cy="16" r="2" />
                  <circle cx="22" cy="16" r="2" />
                </svg>
              </div>
            )}
          </div>

          <div
            className={`border-b-3 ${
              !isSelected && getBorderColor(file.status)
            } p-1 grid grid-cols  w-full h-full rounded-md justify-between text-xs`}
          >
            <div className="relative p-2">
              {file.type && file.type.includes("pdf") && (
                <a href={file.url} target="_blank">
                  <Image
                    src={getIcon(file.type, file.url)}
                    alt={file.id}
                    className="rounded-xl max-h-32 mt-5 cursor-pointer"
                    width={130}
                    height={220}
                  />
                </a>
              )}
              {file.type && file.type.includes("image") && (
                <>
                  <Image
                    src={getIcon(file.type, file.url)}
                    alt={file.id}
                    className="rounded-xl cursor-pointer max-h-32 mt-5"
                    width={130}
                    height={220}
                    onClick={onOpenChange}
                  />
                  <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                    <ModalContent>
                      {(onClose) => (
                        <>
                          <ModalHeader className="flex flex-col gap-1">{`${file.name}`}</ModalHeader>
                          <ModalBody>
                            <Image
                              src={getIcon(file.type, file.url)}
                              alt={file.id}
                              className="w-full h-full p-1 rounded-xl cursor-pointer"
                              width={130}
                              height={220}
                            />
                          </ModalBody>
                          <ModalFooter>
                            <Button
                              color="primary"
                              variant="light"
                              onPress={onClose}
                            >
                              Zavřít
                            </Button>
                          </ModalFooter>
                        </>
                      )}
                    </ModalContent>
                  </Modal>
                </>
              )}
              {file.type &&
                !file.type.includes("pdf") &&
                !file.type.includes("image") && (
                  <Image
                    src={getIcon(file.type, file.url)}
                    alt={file.id}
                    className="rounded-xl cursor-pointer max-h-32 mt-5"
                    width={130}
                    height={220}
                  />
                )}
            </div>
            <div className="text-center">
              <p className="text-sm">{name}</p>
              <p className="text-xs">{validity}</p>
            </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div
          key={Math.random() * 1528 * -file.id}
          className="bg-white dark:bg-slate-800 w-36 h-56 rounded-md shadow-sm relative"
        >
          <div className="flex flex-col items-center w-full space-y-2 mt-2 mb-2">
            <DocumentInfoUpdate
              documentData={documentInfoContent}
              closeDocumentUpdate={() => setIsMenuOpen(false)}
              mutateDocuments={props.mutateDocuments}
            />
            <DocumentInfoUpdate
              documentData={documentInfoContent}
              closeDocumentUpdate={() => setIsMenuOpen(false)}
              mutateDocuments={props.mutateDocuments}
              expiration
            />
            <Button
              className="w-32"
              color="primary"
              variant="bordered"
              type="submit"
              size="sm"
              onPress={() =>
                downloadFileHandler(
                  file.url ? file.url : "",
                  file.type ? file.type : ""
                )
              }
            >
              Stáhnout
            </Button>
            <Button
              className="w-32"
              color="primary"
              variant="bordered"
              type="submit"
              size="sm"
              onPress={() => {
                selectHandler();
                setIsMenuOpen(false);
                props.onDocumentDelete();
              }}
            >
              Smazat
            </Button>
            <Button
              className="w-32"
              color="primary"
              variant="bordered"
              type="submit"
              size="sm"
              onPress={() => setIsMenuOpen(false)}
            >
              Zavřít
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
