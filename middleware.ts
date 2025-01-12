import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";
import { fetchPermissions } from "./app/lib/get-permissions";

const publicRoutes = [
  "/signin",
  "/signup",
  "/manifest.json",
  "/sw.js",
  "/manifest.webmanifest",
  "/icons", // Výjimka pro ikony
  "/screenshots", // Výjimka pro snímky obrazovky
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Povolení statických souborů a veřejných cest
  if (
    path.startsWith("/_next/static/") || // Statické soubory
    publicRoutes.some((route) => path.startsWith(route)) || // Veřejné cesty
    path.startsWith("/icons/") || // Výjimka pro všechny ikony
    path.startsWith("/screenshots/") || // Výjimka pro všechny snímky obrazovky
    path.endsWith(".ico") // Favicon
  ) {
    return NextResponse.next();
  }

  // Ověření session
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  console.log("middleware session verification");

  if (!session) {
    return NextResponse.redirect(`${req.nextUrl.origin}/signin`);
  }

  // Kontrola oprávnění (příklad pro /zamestnanci)
  if (path.includes("zamestnanci") && session) {
    const permissions = await fetchPermissions("employees");
    if (permissions.some((p) => p.action === "read")) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}
