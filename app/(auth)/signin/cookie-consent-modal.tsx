"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/react";

export default function CookieConsentModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);


  useEffect(() => {
    if (process.env.NODE_ENV === "test") return; // Neaktivujeme modal v testech
    console.log("📢 NODE_ENV:", process.env.NODE_ENV);

    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsModalVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsModalVisible(false);
  };

  return (
    <Modal
      isOpen={isModalVisible}
      onClose={() => setIsModalVisible(false)}
      className={`bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700 ${
        process.env.NODE_ENV === "test" ? "hidden" : ""
      }`} // Přidáme hidden v testovacím režimu
    >
      <ModalContent>
        <ModalHeader className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Informace o cookies
          </h3>
        </ModalHeader>
        <ModalBody className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
          <p className="text-slate-400 dark:text-slate-500">
            Tato aplikace používá cookies pro správu přihlášení a ověření vaší identity.
          </p>
        </ModalBody>
        <ModalFooter className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <Button color="warning" variant="flat" onPress={handleAccept} id="initconset">
            Rozumím
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


