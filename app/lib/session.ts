import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AuthenticationData } from "@directus/sdk";
import { DataForSession } from "./models";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

// Typy dat
type SessionPayload = {
  expiresAt: number; // timestamp
};

export async function createSession(dataForSession:DataForSession) {
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // týden


  // Vytvoření session a šifrování
  const session = await encrypt(dataForSession);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: new Date(expiresAt),
  });
}

export async function deleteSession() {
  (await cookies()).delete("session");
}

export async function encrypt(payload: DataForSession) {
  return new SignJWT({payload})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8hr")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, { algorithms: ["HS256"] });

    // Kontrola expirace
    if (payload.expiresAt && Date.now() > Number(payload.expiresAt)) {
      throw new Error("Session expired");
    }

    return payload;
  } catch (error) {
    console.log("Failed to verify session:", error);
    return null;
  }
}
