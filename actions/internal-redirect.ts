"use server";
import { redirect } from "next/navigation";


// internal redirect **************************************************************************************************************************************************
export async function internalRedirect(page: string) {
  redirect(page);
}