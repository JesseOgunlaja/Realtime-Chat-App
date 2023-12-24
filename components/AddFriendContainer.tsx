"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { User } from "@/utils/redis";
import { UUID } from "crypto";
import { useState } from "react";
import AddFriendComponent from "./AddFriendComponent";
import SignedInNavbar from "./SignedInNavbar";

const AddFriendContainer = (props: {
  user: User;
  uuid: UUID;
  usernamesWithIDs: string;
}) => {
  const [user, setUser] = useState<User>(props.user);

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
