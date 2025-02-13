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
  isSubscriptionLoading: boolean;
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
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (!registration) {
          navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => console.log("✅ Service Worker registrován s scope:", reg.scope))
            .catch((error) => console.error("❌ Service Worker registrace selhala:", error));
        }
      });
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      checkSubscriptionStatus();
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      setDeferredPrompt(e);
    };

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    window.addEventListener("beforeinstallprompt", (e) => handleBeforeInstallPrompt(e as BeforeInstallPromptEvent));

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  async function checkSubscriptionStatus() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();

      if (sub?.endpoint) {
        const isSubscribed = await checkSubscription(sub.endpoint);
        if (isSubscribed.success) {
          setSubscription(sub);
        } else {
          console.warn("⚠️ Subscription není platné.");
        }
      } else {
        console.warn("⚠️ Uživatel nemá aktivní subscription.");
      }
    } catch (error) {
      console.error("❌ Chyba při kontrole subscription:", error);
    } finally {
      setIsSubscriptionLoading(false);
    }
  }

  async function subscribeToPush() {
    try {
      console.log("🔄 Probíhá přihlášení k push notifikacím...");
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

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
      console.log("✅ Subscription bylo úspěšně vytvořeno.");
    } catch (error) {
      console.error("❌ Chyba při přihlášení k push notifikacím:", error);
    }
  }

  async function unsubscribeFromPush() {
    try {
      if (!subscription) {
        console.warn("⚠️ No active subscription found.");
        return;
      }

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      setSubscription(null);

      await unsubscribeUser(endpoint);
      console.log("✅ Subscription bylo úspěšně zrušeno.");
    } catch (error) {
      console.error("❌ Chyba při odhlášení z push notifikací:", error);
    }
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        console.log("✅ Uživatel přijal instalaci.");
      } else {
        console.log("❌ Uživatel odmítl instalaci.");
      }
      setDeferredPrompt(null);
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
        isSubscriptionLoading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
