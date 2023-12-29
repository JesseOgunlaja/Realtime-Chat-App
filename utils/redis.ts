import { Redis } from "@upstash/redis";
import { UserType } from "../types/UserTypes";

export const redis = new Redis({
  url: String(process.env.REDIS_URL),
  token: String(process.env.REDIS_SECRET),
});

export async function getUserByName(
  name: string,
  getKey?: boolean
): Promise<UserType | { user: UserType; key: string } | undefined> {
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
      return { user: user as UserType, key };
    }
    return user as UserType;
  } else {
    return undefined;
  }
}
