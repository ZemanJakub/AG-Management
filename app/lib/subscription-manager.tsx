"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Button, Card, CardBody } from "@heroui/react";
import { useState, useEffect } from "react";
import { useSubscription } from "@/app/subscription-context";

export default function SubscriptionManagerModal() {
  const { subscription, subscribeToPush,isSubscribtionLoading } = useSubscription();
  const [isVisible, setIsVisible] = useState(true); // Výchozí stav: modal je skrytý

  useEffect(() => {
    // Zkontroluj stav subscription při načtení
    if (!subscription?.endpoint && !isSubscribtionLoading) {
      console.log("nastavujeme visible")
      setIsVisible(true); // Zobraz modal, pokud není aktivní subscription
    }
    if (subscription?.endpoint) {
      console.log("rušíme  visible")
      setIsVisible(false); // Zobraz modal, pokud není aktivní subscription
    }
  }, [subscription, isSubscribtionLoading]);

  if (!isVisible) {
    return null; // Skryj modal, pokud není třeba zobrazit
  }

  return (
    <Modal
    isOpen={isVisible}
    onClose={() => setIsVisible(false)}
    className="bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700"
  >
    <ModalContent>
      <ModalHeader className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Notifikace
        </h3>
      </ModalHeader>
      <ModalBody className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
        <Card className="bg-white dark:bg-slate-800 shadow-none border-none">
          <CardBody>
            <p className="text-slate-400 dark:text-slate-500">
              Přihlašte se k odběru push notifikací, abyste byli informováni o
              událostech v aplikaci i v případě, že aplikaci aktuálně
              nepoužíváte.
            </p>
            <p className="pt-2 text-amber-500 dark:text-amber-400">
              K odběru se přihlašujte výhradně na bezpečném zařízení, které je ve
              vašem vlastnictví, nebo jej máte v trvalém užívání.
            </p>
          </CardBody>
        </Card>
      </ModalBody>
      <ModalFooter className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <Button
          className="bg-indigo-500 text-white hover:bg-indigo-600"
          onPress={async () => {
            await subscribeToPush(); // Přihlášení k odběru
            setIsVisible(false); // Zavři modal po úspěšném přihlášení
          }}
        >
          Přihlásit se k odběru
        </Button>
        <Button
          variant="flat"
         className="bg-amber-500 text-white hover:bg-amber-600"
          onPress={() => setIsVisible(false)} // Zavři modal
        >
          Zavřít
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
  
  
  );
}
