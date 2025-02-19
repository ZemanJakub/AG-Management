"use client";

import { sendNotification } from "@/actions";
import { useSubscription } from "@/app/subscription-context";
import { useEffect, useState } from "react";
import { Button, Spinner, Switch } from "@heroui/react";
import { toast } from "react-toastify";

export default function NotificationsPanel() {
  const { unsubscribeFromPush, subscribeToPush, subscription,isSubscriptionLoading } = useSubscription();

  // Přepínače
  const [pushMessages, setPushMessages] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<boolean>(true);

  // Inicializace stavů na základě `subscription`
  useEffect(() => {
    setPushMessages(!!subscription);
// Můžete změnit výchozí hodnotu dle potřeby
  }, [subscription]);

  const sendNotifications = () => {
    sendNotification(
      "Nastavení",
      "Toto je testovací notifikace",
      "/settings/notifications"
    );
  };

  const deleteAppNotifications = () => {
    console.log("Smazání notifikací");
    // TODO: Implementace mazání notifikací uživatele
  };

  const saveChanges = () => {
    console.log("Uložení změn");
    if (!subscription && pushMessages) {
      subscribeToPush();
      toast.success("Push notifikace byly úspěšně aktivovány.", {
        autoClose: 2000,
        hideProgressBar: false,
        theme: "dark",
      });
    } else if (subscription && !pushMessages) {
      unsubscribeFromPush();
      toast.success("Push notifikace byly úspěšně deaktivovány.", {
        autoClose: 2000,
        hideProgressBar: false,
        theme: "dark",
      });
    }

    if (notifications) {
      toast.success("Notifikace byly úspěšně aktivovány.", {
        autoClose: 2000,
        hideProgressBar: false,
        theme: "dark",
      });
    } else if (!notifications) {
      toast.success("Notifikace byly úspěšně deaktivovany.", {
        autoClose: 2000,
        hideProgressBar: false,
        theme: "dark",
      });
    }
  };

  return (
    <div className="grow">
      {/* Panel body */}
      <div className="p-6 space-y-6">
        <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-5">Oznámení</h2>

        {/* General */}
        <section>
          <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-1">Push notifikace</h3>
          <ul>
            <li className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700/60">
              {/* Left */}
              <div>
                <div className="text-gray-800 dark:text-gray-100 font-semibold">Push notifikace</div>
                <div className="text-sm">
                  Umožňují uživateli zasílat zprávy pomocí systémového rozhraní i v případě, že aplikaci aktuálně nevyužívá. Nastavení je platné pouze pro aktuální zařízení.
                </div>
              </div>
              {/* Right */}
              <div className="flex items-center ml-4">
              {isSubscriptionLoading ? (<Spinner color="secondary"/>) : (   <Switch
                  isSelected={pushMessages}
                  onValueChange={() => setPushMessages(!pushMessages)}
                  color="secondary"
                  size="lg"
                />)}
             
              </div>
            </li>
            <li className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700/60">
              {/* Left */}
              <div>
                <div className="text-gray-800 dark:text-gray-100 font-semibold">Test odesílání</div>
                <div className="text-sm">
                  Domníváte se, že odesílání zpráv nefunguje správně? Odešlete testovací zprávu.
                </div>
              </div>
              {/* Right */}
              <div className="flex items-center ml-4">
                <Button
                  color="secondary"
                  variant="bordered"
                  className=" ml-2"
                  onPress={sendNotifications}
                >
                  Odeslat
                </Button>
              </div>
            </li>
          </ul>
        </section>

        {/* Application Notifications */}
        <section>
          <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-1">Notifikace v aplikaci</h3>
          <ul>
            <li className="flex justify-between items-center py-3 ">
              {/* Left */}
              <div>
                <div className="text-gray-800 dark:text-gray-100 font-semibold">Vymazat notifikace</div>
                <div className="text-sm">
                  Pokud se Vám nahromadilo větší množství notifikací a chcete je jednorázově vymazat, použijte tuto volbu.
                  Upozorňujeme, že volba je nevratná.
                </div>
              </div>
              {/* Right */}
              <div className="flex items-center ml-4">
                <Button
                  color="danger"
                  variant="bordered"
                  className="ml-2"
                  onPress={deleteAppNotifications}
                >
                  Smazat
                </Button>
              </div>
            </li>
          </ul>
        </section>
      </div>

      {/* Panel footer */}
      <footer>
        <div className="flex flex-col px-6 py-5 border-t border-gray-200 dark:border-gray-700/60">
          <div className="flex self-end">
            <Button
              color="secondary"
              className="ml-3"
              onPress={saveChanges}
            >
              Uložit změny
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}