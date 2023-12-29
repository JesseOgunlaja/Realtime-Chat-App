"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { DashboardPageContainerPropsType } from "@/types/ComponentTypes";
import { UserType } from "@/types/UserTypes";
import { useState } from "react";
import AddFriendComponent from "./AddFriendComponent";
import SignedInNavbar from "./SignedInNavbar";

const AddFriendContainer = (props: DashboardPageContainerPropsType) => {
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
      <AddFriendComponent
        usernamesWithIDs={props.usernamesWithIDs}
        user={user || props.user}
        setUser={setUser}
      />
    </>
  );
};

export default AddFriendContainer;
