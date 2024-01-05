import { Redis } from "@upstash/redis";
import { UserDetailsList, UserType } from "../types/UserTypes";

export const redis = new Redis({
  url: String(process.env.REDIS_URL),
  token: String(process.env.REDIS_SECRET),
});

export async function getUserByName(
  name: string,
  getKey?: boolean
): Promise<UserType | { user: UserType; key: string } | undefined> {
  const users = (await redis.lrange("User details", 0, -1)) as UserDetailsList;
  const names = users.map((val) => val.name);
  if (names.includes(name.toLowerCase())) {
    const key = users[names.indexOf(name.toLowerCase())].id;
    const user = await redis.hgetall(key);
    if (getKey === true) {
      return { user: user as UserType, key };
    }
    return user as UserType;
  } else {
    return undefined;
  }
}
