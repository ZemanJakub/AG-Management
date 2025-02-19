import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";
import { fetchPermissions } from "./app/lib/get-permissions";
import { isPublicRoute } from "./lib/publicRoutes";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Pokud je cesta veřejná, pokračujeme bez omezení
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // Ověření session
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  console.log("📢 Middleware session data:", session); // DEBUG
  if (!session) {
    const redirectUrl = req.nextUrl.pathname + req.nextUrl.search; // Uložíme původní URL
    return NextResponse.redirect(`${req.nextUrl.origin}/signin?redirect=${encodeURIComponent(redirectUrl)}`);
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

