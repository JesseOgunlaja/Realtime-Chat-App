"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { ProtectedPageContainerPropsType } from "@/types/ComponentTypes";
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { UUID } from "crypto";
import { useState } from "react";
import SignedInNavbar from "../Navbar/SignedInNavbar";
import ChatComponent from "./ChatComponent";

const ChatContainer = (
  props: ProtectedPageContainerPropsType & {
    chatID: UUID;
    chatIndex: number;
  }
) => {
  const [user, setUser] = useState<UserType>(props.user);
  const [userDetailsList, setUserDetailsList] = useState<UserDetailsList>(
    props.userDetailsList
  );

  useWebsockets(props.userKey, user, setUser, props.userDetailsList);

  const propsBeingPassed = {
    userDetailsList,
    setUserDetailsList,
    userKey: props.userKey,
    user,
    setUser,
  };

  return (
    <>
      <SignedInNavbar {...propsBeingPassed} />
      <ChatComponent
        {...propsBeingPassed}
        chatID={props.chatID}
        chatIndex={props.chatIndex}
      />
    </>
  );
};

export default ChatContainer;
