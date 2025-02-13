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
import Link from "next/link";

export default function CookieConsentModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Kontrola, zda už uživatel modal viděl
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsModalVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Uložení souhlasu do localStorage
    localStorage.setItem("cookieConsent", "true");
    setIsModalVisible(false);
  };

  return (
    <Modal
      isOpen={isModalVisible}
      onClose={() => setIsModalVisible(false)}
      className="bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700"
    >
      <ModalContent>
        <ModalHeader className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Informace o cookies
          </h3>
        </ModalHeader>
        <ModalBody className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
          <p className="text-slate-400 dark:text-slate-500">
            Tato aplikace používá cookies pro správu přihlášení a ověření vaší
            identity. Tyto cookies jsou nezbytné pro správnou funkčnost aplikace
            a nejsou používány k jiným účelům, jako je sledování nebo reklama.
          </p>
          {/* <p className="mt-2 text-slate-400 dark:text-slate-500">
            Další informace naleznete v našich{" "}
            <Link
              href="/privacy-policy"
              className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-500"
            >
              Zásadách ochrany osobních údajů
            </Link>
            .
          </p> */}
        </ModalBody>
        <ModalFooter className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <Button
            color="warning"
            variant="flat"
            onPress={handleAccept}
          >
            Rozumím
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
