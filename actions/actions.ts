"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";

export async function generateUUID() {
  return randomUUID();
}

export async function getHeader(headerName: string) {
  const headersList = headers();
  const header = headersList.get(headerName);
  return header;
}
