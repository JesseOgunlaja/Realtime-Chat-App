"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { User } from "@/utils/redis";
import { UUID } from "crypto";
import { useState } from "react";
import ChatComponent from "./ChatComponent";
import SignedInNavbar from "./SignedInNavbar";

const ChatContainer = (props: {
  user: User;
  uuid: UUID;
  chatID: UUID;
  chatIndex: number;
  usernamesWithIDs: string;
}) => {
  const [user, setUser] = useState<User>(props.user);

  useWebsockets(props.uuid, user || props.user, setUser);

  return (
    <>
      <SignedInNavbar
        usernamesWithIDs={props.usernamesWithIDs}
        user={user || props.user}
        setUser={setUser}
      />
      <ChatComponent
        user={user || props.user}
        setUser={setUser}
        usernamesWithIDs={props.usernamesWithIDs}
        uuid={props.uuid}
        chatID={props.chatID}
        chatIndex={props.chatIndex}
      />
    </>
  );
};

export default ChatContainer;
