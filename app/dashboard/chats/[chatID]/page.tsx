import ChatContainer from "@/components/ChatContainer";
import { User } from "@/utils/redis";
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
  const user: User = data.user;
  const key: UUID = data.key;
  let chatIndex: any;

  if (
    !user.chats.some((chat, index) => {
      if (chat.id === params.chatID) {
        chatIndex = index;
        return true;
      }
      return false;
    })
  ) {
    notFound();
  }

  return (
    <ChatContainer
      user={user}
      uuid={key as UUID}
      chatIndex={chatIndex}
      chatID={params.chatID as UUID}
    />
  );
};

export default Page;
