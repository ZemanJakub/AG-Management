// Událost notificationclick
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification);

  event.notification.close();

  const action = event.action;
  console.log("Clicked action:", action);

  if (action === "openUrl" && event.notification.data?.openUrl) {
    console.log("Otevírám URL:", event.notification.data.openUrl);
    event.waitUntil(
      clients.openWindow(event.notification.data.openUrl).catch((error) => {
        console.error("Failed to open URL:", error);
      })
    );
  } else if (action === "confirm") {
    console.log("Notifikace zavřena.");
  } else {
    console.log("Kliknuto mimo tlačítka.");
    event.waitUntil(
      (async () => {
        if (event.notification.data?.openUrl) {
          try {
            await clients.openWindow(event.notification.data.openUrl);
          } catch (error) {
            console.error("Failed to open URL:", error);
          }
        }
      })()
    );
  }
});

// Událost activate
self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== "offline-cache") {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Událost install
self.addEventListener("install", (event) => {
  console.log("Service worker installed");
  self.skipWaiting(); // Vynutí okamžitou aktivaci nové verze
  event.waitUntil(
    caches.open("offline-cache").then((cache) => {
      return cache.addAll([
        "/offline.html", // Ujistěte se, že cesta odpovídá vaší struktuře
      ]);
    }).catch((error) => {
      console.error("Failed to cache offline resources:", error);
    })
  );
});

// Událost fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html");
        }
      })
  );
});

// Událost push
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);
  const data = event.data ? event.data.json() : null;

  if (data) {
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        vibrate: data.vibrate,
        actions: data.actions,
        data: data.data, // Připojení data k notifikaci
      }).catch((error) => {
        console.error("Failed to show notification:", error);
      })
    );
  } else {
    console.error("No data received in push event.");
  }
});
