"use server";

import { UserType } from "@/types/UserTypes";
import { redis } from "@/utils/redis";
import { UUID } from "crypto";
import { revalidatePath } from "next/cache";

export default async function hideChatAction(
  userKey: UUID,
  user: UserType,
  chatID: UUID,
  pathname: string
) {
  user.chats.find((chat) => chat.id === chatID)!.visible = false;
  await redis.hset(userKey, {
    chats: user.chats,
  });

  revalidatePath(pathname);
}
