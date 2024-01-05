"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { ProtectedPageContainerPropsType } from "@/types/ComponentTypes";
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { useState } from "react";
import SignedInNavbar from "../Navbar/SignedInNavbar";
import FriendsComponent from "./FriendsComponent";

const FriendsContainer = (props: ProtectedPageContainerPropsType) => {
  const [user, setUser] = useState<UserType>(props.user);
  const [userDetailsList, setUserDetailsList] = useState<UserDetailsList>(
    props.userDetailsList
  );

  useWebsockets(props.userKey, user, setUser, userDetailsList);

  const propsBeingPassed = {
    userDetailsList,
    user,
    setUser,
    setUserDetailsList,
    userKey: props.userKey,
  };

  return (
    <>
      <SignedInNavbar {...propsBeingPassed} />
      <FriendsComponent {...propsBeingPassed} />
    </>
  );
};

export default FriendsContainer;
