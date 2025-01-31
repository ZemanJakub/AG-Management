"use client";
import { useSubscription } from "@/app/subscription-context";
import ShareIcon from "@/components/my-icons/share-icon";
import { Button } from "@heroui/react";

export default function AppsPanel() {
  const { handleInstallClick, isInstallable, isStandalone, isIOS } =
    useSubscription();

  return (
    <div className="grow">
      {/* Panel body */}
      <div className="p-6">
        {isStandalone ? <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-5">
          Aplikace je na Vašem zařízení již instalována
        </h2> : <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-5">
          Instalace aplikace
          </h2>}
        <div>
          <div className="text-sm mb-5">
            Aplikaci lze nainstalovat přímo na Vaše zařízení. Tato instalace
            umožní aplikaci operovat nezávisle, bez nutnosti použití webového
            prohlížeče. Ukládání dat, především obrázků, do Vašeho zařízení
            zlepší rychlost a výkon aplikace, což povede k lepšímu uživatelskému
            zážitku.
          </div>
        </div>
        <section>
          <ul>
            <li className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700/60">
              {/* Left */}
              <div>
                <div className="text-gray-800 dark:text-gray-100 font-semibold">
                  Operační systémy Android a Windows
                </div>
                <div className="text-sm">
                  Pokud se na konci tohoto řádku nezobrazuje tlačítko
                  "Instalovat", znamená to, že nastavení Vašeho prohlížeče
                  instalaci neumožňuje. Zkontrolujte, že máte pro tuto stránku
                  povolen javascript a cookies.
                </div>
              </div>
              {/* Right */}
              <div className="flex items-center ml-4">
              {isInstallable && !isIOS &&  <Button
                  variant="solid"
                  color="primary"
                  className="ml-2"
                  onPress={handleInstallClick}
                >
                  Instalovat
                </Button>}
              </div>
            </li>
            <li className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700/60">
              {/* Left */}
              <div>
                <div className="text-gray-800 dark:text-gray-100 font-semibold">
                  Operační systém iOS
                </div>
                <div className="text-sm">
                  V systému iOS probíhá instalace přidáním aplikace na domovskou
                  obrazovku. Pro instalace aplikujte následující postup:
                </div>
                <ul className="pt-4 pb-2">
                  <li>
                    <div className="flex">
                      1. Klikněte na tlačítko sdílení
                      <div className="ml-2">
                        <ShareIcon />
                      </div>
                    </div>
                  </li>
                  <li>
                    <p className="mt-2">2. Zvolte „Přidat na plochu“</p>
                  </li>
                </ul>
              </div>
              {/* Right */}
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
