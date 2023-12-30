"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { DashboardPageContainerPropsType } from "@/types/ComponentTypes";
import { UserType } from "@/types/UserTypes";
import { useState } from "react";
import FriendsComponent from "./FriendsComponent";
import SignedInNavbar from "./SignedInNavbar";

const FriendsContainer = (props: DashboardPageContainerPropsType) => {
  const [user, setUser] = useState<UserType>(props.user);

  useWebsockets(props.uuid, user, setUser, props.usernamesWithIDs);

  return (
    <>
      <SignedInNavbar
        usernamesWithIDs={props.usernamesWithIDs}
        user={user}
        setUser={setUser}
      />
      <FriendsComponent
        usernamesWithIDs={props.usernamesWithIDs}
        user={user}
        setUser={setUser}
      />
    </>
  );
};

export default FriendsContainer;
