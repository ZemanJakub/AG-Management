/**
 * Seznam veřejných cest, které nevyžadují autentizaci.
 */
export const publicRoutes: string[] = [
    "/signin",
    "/signup",
    "/manifest.json",
    "/sw.js",
    "/manifest.webmanifest",
    "/icons", // Výjimka pro ikony
    "/screenshots", // Výjimka pro snímky obrazovky
    "/favicon.ico",
    "/_next/static/", // Statické soubory Next.js
    "/api/public", // Možná API endpointy, které jsou veřejné
  ];
  
  /**
   * Kontrola, zda je daná cesta veřejná.
   * @param path - Cesta k validaci
   * @returns true, pokud je veřejná
   */
  export const isPublicRoute = (path: string): boolean => {
    return publicRoutes.some(route => path.startsWith(route));
  };
  