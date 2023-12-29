"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { DashboardPageContainerPropsType } from "@/types/ComponentTypes";
import { UserType } from "@/types/UserTypes";
import { UUID } from "crypto";
import { useState } from "react";
import ChatComponent from "./ChatComponent";
import SignedInNavbar from "./SignedInNavbar";

const ChatContainer = (
  props: DashboardPageContainerPropsType & {
    chatID: UUID;
    chatIndex: number;
  }
) => {
  const [user, setUser] = useState<UserType>(props.user);

  useWebsockets(
    props.uuid,
    user || props.user,
    setUser,
    props.usernamesWithIDs
  );

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
