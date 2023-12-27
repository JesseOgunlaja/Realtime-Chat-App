import { Redis } from "@upstash/redis";
import { UUID } from "crypto";

export const redis = new Redis({
  url: String(process.env.REDIS_URL),
  token: String(process.env.REDIS_SECRET),
});

export async function getUserByName(
  name: string,
  getKey?: boolean
): Promise<User | { user: User; key: string } | undefined> {
  const users = (await redis.lrange("Usernames", 0, -1)) as unknown as Record<
    string,
    any
  >[];
  const names: any[] = users.map(
    (val) => (val as unknown as Record<string, unknown>)?.name
  );
  if (names.includes(name.toUpperCase())) {
    const key = users[names.indexOf(name.toUpperCase())].id;
    const user = await redis.hgetall(key);
    if (getKey === true) {
      return { user: user as User, key };
    }
    return user as User;
  } else {
    return undefined;
  }
}

export type Message = {
  message: string;
  fromYou: boolean;
  timestamp: number;
  id: UUID;
  replyID?: UUID;
};

export type Chat = {
  id: UUID;
  messages: Message[];
  withID: UUID;
  visible: boolean;
};

export type IncomingFriendRequest = {
  fromID: UUID;
};

export type OutgoingFriendRequest = {
  toID: UUID;
};

export type Friend = {
  id: UUID;
};

export type User = {
  profilePicture: string;
  username: string;
  displayName: string;
  password: string;
  incomingFriendRequests: IncomingFriendRequest[];
  outgoingFriendRequests: OutgoingFriendRequest[];
  friends: Friend[];
  chats: Chat[];
  uuid: UUID;
};
