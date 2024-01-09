import ChatContainer from "@/components/Chats/ChatContainer";
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { decryptString } from "@/utils/encryption";
import { UUID } from "crypto";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

const Page = async ({ params }: { params: { chatID: string } }) => {
  const token = cookies().get("token")?.value;
  const res = await fetch(`${process.env.URL}/api/user`, {
    cache: "no-store",
    headers: {
      cookie: `token=${token}`,
    },
  });
  const data = await res.json();
  const user: UserType = data.user;
  const key: UUID = data.key;

  const userDetailsList = JSON.parse(
    decryptString(data.userDetailsList, false)
  ) as UserDetailsList;

  const chatIndex = user.chats.findIndex((chat) => chat.id === params.chatID);

  if (chatIndex === -1) {
    notFound();
  }

  return (
    <ChatContainer
      user={user}
      key={JSON.stringify(user)}
      userDetailsList={userDetailsList}
      userKey={key as UUID}
      chatIndex={chatIndex}
      chatID={params.chatID as UUID}
    />
  );
};

export default Page;
