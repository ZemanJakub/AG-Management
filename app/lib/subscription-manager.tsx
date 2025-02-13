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
  const { subscription, subscribeToPush, isSubscriptionLoading } = useSubscription();
  const [isVisible, setIsVisible] = useState<boolean>(() => !subscription?.endpoint && !isSubscriptionLoading);

  useEffect(() => {
    setIsVisible(!subscription?.endpoint && !isSubscriptionLoading);
  }, [subscription, isSubscriptionLoading]);

  if (!isVisible) {
    return null; // Skryj modal, pokud není třeba zobrazit
  }

  async function handleSubscribe() {
    try {
      await subscribeToPush(); // Přihlášení k odběru
    } catch (error) {
      console.error("❌ Chyba při přihlašování k odběru:", error);
    } finally {
      setIsVisible(false); // Zavři modal po úspěšném pokusu o přihlášení (ať už úspěšný nebo ne)
    }
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
            onPress={handleSubscribe}
          >
            Přihlásit se k odběru
          </Button>
          <Button
            variant="flat"
            className="bg-amber-500 text-white hover:bg-amber-600"
            onPress={() => setIsVisible(false)}
          >
            Zavřít
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
