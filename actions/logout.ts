"use server";

import { cookies } from "next/headers";

export default async function logoutAction() {
  cookies().delete("token");
}
