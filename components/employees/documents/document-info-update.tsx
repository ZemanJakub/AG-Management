import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Select,
  SelectItem,
  Input,
} from "@nextui-org/react";
import { DatePicker } from "@nextui-org/date-picker";
import { parseDate } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { today, getLocalTimeZone, endOfYear } from "@internationalized/date";
import { toast } from "react-toastify";
import { z } from "zod";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { CalendarDate } from "@nextui-org/calendar";

interface DocumentInfoUpdateProps {
  expiration?:boolean;
  documentData: FormProps;
  closeDocumentUpdate: () => void;
  mutateDocuments: () => void;
}

interface FormProps {
  validFrom?: any;
  validTo?: any;
  documentId?: string;
  holderId?: string;
  folderId?: string;
  name: string;
  type?: string;
  contractType?: string;
  documentType?: string;
  status: string;
  url?: string;
  date_created: string;
  id: string;
  created_by?: string;
  updated_by?: string;
  date_updated?: string;
}

const employeeSchema = z.object({
  documentId: z.string().refine((data) => data.trim() !== "", {
    message: "Nedostatek dat pro uložení  formuláře.",
  }),
  holderId: z.string().refine((data) => data.trim() !== "", {
    message: "Nedostatek dat pro uložení  formuláře.",
  }),
  folderId: z.string().refine((data) => data.trim() !== "", {
    message: "Nedostatek dat pro uložení  formuláře.",
  }),
  name: z.string().refine((data) => data.trim() !== "", {
    message: "Nedostatek dat pro uložení  formuláře.",
  }),
  type: z.string().refine((data) => data.trim() !== "", {
    message: "Nedostatek dat pro uložení  formuláře.",
  }),
  documentType: z
    .string()
    .refine((data) => data.trim() !== "" && data.trim() !== "NaN", {
      message: "Je nutné vybrat druh dokumentu.",
    }),
  // contractType: z.string().refine((data) => data.trim() !== "NaN", {
  //   message: "Je nutné vybrat druh smlouvy.",
  // }),
});

const dotumentTypes = [
  { value: "NaN", label: "NaN" },
  { value: "contract", label: "Smlouva" },
  { value: "Prohlášení PPDPFO", label: "Prohlášení PPDPFO" },
  { value: "Výpis RT", label: "Výpis RT" },
  { value: "Certifikát", label: "Certifikát" },
  { value: "Diplom", label: "Diplom" },
  { value: "Zdravotní prohlídka", label: "Zdravotní prohlídka" },
  { value: "Karta pojištěnce", label: "Karta pojištěnce" },
  { value: "Vízum", label: "Vízum" },
  { value: "Povolení k pobytu", label: "Povolení k pobytu" },
  { value: "Jiný", label: "Jiný" },
];

const contractTypes = [
  { value: "NaN", label: "NaN" },
  { value: "HPP AG s.r.o.", label: "HPP AG s.r.o." },
  { value: "DPČ AG s.r.o.", label: "DPČ AG s.r.o." },
  { value: "DPP AG s.r.o.", label: "DPP AG s.r.o." },
  { value: "DPČ F s.r.o.", label: "DPČ F s.r.o." },
  { value: "DPP F s.r.o.", label: "DPP F s.r.o." },
  { value: "Jednorázový příjem", label: "Jednorázový příjem" },
];

const formatDate = (date: CalendarDate): string => {
  const year = date.year.toString();
  const month = date.month < 10 ? `0${date.month}` : date.month.toString();
  const day = date.day < 10 ? `0${date.day}` : date.day.toString();
  return `${year}-${month}-${day}`;
};

const DocumentInfoUpdate = ({
  expiration,
  documentData,
  closeDocumentUpdate,
  mutateDocuments,
}: DocumentInfoUpdateProps) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
 
  const initialValues = {
    ...documentData,
    documentType: documentData.documentType || "NaN",
    contractType: documentData.contractType || "NaN",
    validFrom: documentData.validFrom
      ? parseDate(documentData.validFrom)
      : today(getLocalTimeZone()),
    validTo: expiration? today(getLocalTimeZone()):(documentData.validTo
      ? parseDate(documentData.validTo)
      : endOfYear(today(getLocalTimeZone()))),
  };
  const formik = useFormik({
    initialValues,
    validateOnChange: true,
    onSubmit: async (values) => {
      const formToSend = new FormData();
      formToSend.append("validFrom", formatDate(values.validFrom));
      formToSend.append("validTo", formatDate(values.validTo));
      if (values.documentId) {
        formToSend.append("documentId", values.documentId);
      }
      if (values.holderId) {
        formToSend.append("holderId", values.holderId);
      }
      if (values.folderId) {
        formToSend.append("folderId", values.folderId);
      }
      formToSend.append("name", values.name);
      if (values.type) {
        formToSend.append("type", values.type);
      }
      if (values.contractType) {
        formToSend.append("contractType", values.contractType);
      }
      if (values.documentType) {
        formToSend.append("documentType", values.documentType);
      }
      formToSend.append("status", values.status);
      if (values.url) {
        formToSend.append("url", values.url);
      }
      formToSend.append("date_created", values.date_created);
      formToSend.append("id", values.id);
      if (values.created_by) {
        formToSend.append("created_by", values.created_by);
      }
      if (values.updated_by) {
        formToSend.append("updated_by", values.updated_by);
      }
      if (values.date_updated) {
        formToSend.append("date_updated", values.date_updated);
      }

      const result = await fetch("/api/saveDocumentInfo", {
        method: "POST",
        body: formToSend,
      });
      if (result.status !== 200) {
        const text = await result.text();
        toast.warn(`${text}`, {
          autoClose: 5000,
          hideProgressBar: true,
          theme: "dark",
        });
        return;
      }
      toast.success("Data byla úspěšně uložena.", {
        autoClose: 2000,
        hideProgressBar: true,
        theme: "dark",
      });
      console.log("Odesláno:", result);
      closeDocumentUpdate();
      mutateDocuments();
    },
    validationSchema: toFormikValidationSchema(employeeSchema),
  });
  const buttonText = expiration?"Změnit platnost":"Platný dokument";

  return (
    <>
      <Button
        className="w-32"
        color="primary"
        variant="bordered"
        type="submit"
        size="sm"
        onPress={onOpenChange}
      >
        {buttonText}
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={closeDocumentUpdate}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={formik.handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">{`Informace o dokumentu`}</ModalHeader>
              <ModalBody>
                <Select
                  labelPlacement="outside"
                  label="Druh dokumentu"
                  // className="max-w-[284px]"
                  selectedKeys={[formik.values.documentType]}
                  // onChange={handleTypeSelectionChange}
                  isInvalid={formik.errors.documentType !== undefined}
                  defaultSelectedKeys={[formik.values.documentType]}
                  onChange={formik.handleChange}
                  value={formik.values.documentType}
                  id="documentType"
                  name="documentType"
                >
                  {dotumentTypes.map((dotument) => (
                    <SelectItem key={dotument.value} value={dotument.value}>
                      {dotument.label}
                    </SelectItem>
                  ))}
                </Select>
                {formik.values.documentType === "contract" && (
                  <Select
                    labelPlacement="outside"
                    label="Druh smlouvy"
                    id="contractType"
                    name="contractType"
                    selectedKeys={[formik.values.contractType]}
                    defaultSelectedKeys={[formik.values.contractType]}
                    isInvalid={formik.errors.contractType !== undefined}
                    onChange={formik.handleChange}
                    value={formik.values.contractType}
                  >
                    {contractTypes.map((contract) => (
                      <SelectItem key={contract.value} value={contract.value}>
                        {contract.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
                <I18nProvider locale="cs-CZ">
                  <DatePicker
                    label={"Platný od"}
                    labelPlacement="outside"
                    id="validFrom"
                    name="validFrom"
                    defaultValue={formik.values.validFrom}
                    variant="underlined"
                    showMonthAndYearPickers
                    onChange={(date) => {
                      formik.setFieldValue("validFrom", date);
                    }}
                    value={formik.values.validFrom}
                  />
                  <DatePicker
                    CalendarBottomContent={
                      <div className="flex w-full justify-center mt-2 mb-2">
                        <Button
                          size="sm"
                          onPress={() => {
                            formik.setFieldValue(
                              "validTo",
                              parseDate("2099-12-31")
                            );
                          }}
                        >
                          Bez omezení
                        </Button>
                      </div>
                    }
                    label={"Platný do"}
                    labelPlacement="outside"
                    defaultValue={formik.values.validTo}
                    onChange={(date) => {
                      formik.setFieldValue("validTo", date);
                    }}
                    value={formik.values.validTo}
                    variant="underlined"
                    showMonthAndYearPickers
                  />
                </I18nProvider>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" type="submit">
                  Uložit
                </Button>
                <Button color="primary" variant="light" onPress={onClose}>
                  Zavřít
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DocumentInfoUpdate;
