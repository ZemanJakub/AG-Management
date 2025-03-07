"use server";

import { deleteSession } from "app/lib/session";

import { redirect } from "next/navigation";

export async function logout() {
  try {
    await deleteSession();
    redirect("/signin");
  } catch (error) {
    console.error("Error during logout:", error);
    // In a real application, you might also want to log this to an error-tracking service
  }
}