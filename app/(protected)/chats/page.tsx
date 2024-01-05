import ChatsContainer from "@/components/Chats/ChatsContainer";
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { decryptString } from "@/utils/encryption";
import { UUID } from "crypto";
import { cookies } from "next/headers";

const Page = async () => {
  const token = cookies().get("token")?.value;
  const res = await fetch(`${process.env.URL}/api/user`, {
    next: {
      revalidate: 0,
    },
    headers: {
      cookie: `token=${token}`,
    },
  });
  const data = await res.json();
  const user: UserType = data.user;
  const key: UUID = data.key;

  const usernamesList = JSON.parse(
    decryptString(data.usernamesList, false)
  ) as UserDetailsList;

  return (
    <ChatsContainer usernamesList={usernamesList} userKey={key} user={user} />
  );
};

export default Page;
