"use server";

import { randomUUID } from "crypto";

export async function generateUUID() {
  return randomUUID();
}
