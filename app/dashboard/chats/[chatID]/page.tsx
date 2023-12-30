import ChatContainer from "@/components/ChatContainer";
import { UserType } from "@/types/UserTypes";
import { UUID } from "crypto";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

const Page = async ({ params }: { params: { chatID: string } }) => {
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
  const chatIndex = user.chats.findIndex((chat) => chat.id === params.chatID);

  if (chatIndex === -1) {
    notFound();
  }

  return (
    <ChatContainer
      user={user}
      usernamesWithIDs={data.usernamesWithIDs}
      uuid={key as UUID}
      chatIndex={chatIndex}
      chatID={params.chatID as UUID}
    />
  );
};

export default Page;
