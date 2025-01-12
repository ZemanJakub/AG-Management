"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser, checkSubscription } from "@/actions";


interface SubscriptionContextProps {
  subscription: PushSubscription | null;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
  handleInstallClick: () => Promise<void>;
  isInstallable: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isSubscribtionLoading: boolean;
}
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const SubscriptionContext = createContext<SubscriptionContextProps | undefined>(
  undefined
);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
   
    const [isSubscribtionLoading, setIsSubscribtionLoading] =
    useState(true);

    useEffect(() => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registrován s scope:", registration.scope);
          })
          .catch((error) => {
            console.error("Service Worker registrace selhala:", error);
          });
      }
      if ("serviceWorker" in navigator && "PushManager" in window) {
        checkSubscriptionStatus(); // Funkce pro kontrolu stavu subscription
      }
    
      // Zde zpracujeme `beforeinstallprompt`
      const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
        // e.preventDefault(); // Zabraňte výchozímu chování
        setDeferredPrompt(e); // Uložte událost pro pozdější použití
      };
    
      // Nastavení příznaků pro iOS a standalone režim
      setIsIOS(
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      );
      setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
    
      window.addEventListener("beforeinstallprompt", (e) => handleBeforeInstallPrompt(e as BeforeInstallPromptEvent));
    
      // Cleanup listener při odpojení komponenty
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      };
    }, []);
  
  async function checkSubscriptionStatus() {

    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();

    if (sub) {
      const isSubscribed = await checkSubscription(sub.endpoint);
      if (isSubscribed.success) {

        setSubscription(sub); // Uživatel má platné subscription
        setIsSubscribtionLoading(false);
      } else {
        console.log("Subscription není platné.");
        setIsSubscribtionLoading(false);
      }
    } else {
      console.log("Uživatel nemá aktivní subscription.");
      setIsSubscribtionLoading(false);
    }
  }

  async function subscribeToPush() {
    console.log("sub to push")
    const registration = await navigator.serviceWorker.ready;
    console.log(registration)
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    console.log(sub)
    setSubscription(sub);

    const convertedSub = {
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime,
      keys: {
        p256dh: sub.toJSON().keys?.p256dh || "",
        auth: sub.toJSON().keys?.auth || "",
      },
    };

    await subscribeUser(convertedSub);
    console.log("Subscription bylo úspěšně vytvořeno.");
  }

  async function unsubscribeFromPush() {
    if (!subscription) {
      console.error("No active subscription found.");
      return;
    }

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    setSubscription(null);

    await unsubscribeUser(endpoint);
    console.log("Subscription bylo úspěšně zrušeno.");
  }

 

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        console.log("Uživatel přijal instalaci.");
      } else {
        console.log("Uživatel odmítl instalaci.");
      }
      setDeferredPrompt(null); // Reset prompt
    }
  }

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        subscribeToPush,
        unsubscribeFromPush,
        handleInstallClick,
        isInstallable: !!deferredPrompt,
        isStandalone,
        isIOS,
        isSubscribtionLoading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
