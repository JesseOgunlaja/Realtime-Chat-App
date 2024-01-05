"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { ProtectedPageContainerPropsType } from "@/types/ComponentTypes";
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { useState } from "react";
import SignedInNavbar from "../Navbar/SignedInNavbar";
import ChatsComponent from "./ChatsComponent";

const ChatsContainer = (props: ProtectedPageContainerPropsType) => {
  const [user, setUser] = useState<UserType>(props.user);
  const [usernamesList, setUsernamesList] = useState<UserDetailsList>(
    props.usernamesList
  );

  useWebsockets(props.userKey, user, setUser, usernamesList);

  const propsBeingPassed = {
    usernamesList,
    user,
    setUser,
    setUsernamesList,
    userKey: props.userKey,
  };

  return (
    <>
      <SignedInNavbar {...propsBeingPassed} />
      <ChatsComponent {...propsBeingPassed} />
    </>
  );
};

export default ChatsContainer;
