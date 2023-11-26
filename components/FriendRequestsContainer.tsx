"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { User } from "@/utils/redis";
import { UUID } from "crypto";
import { useState } from "react";
import FriendRequestsComponent from "./FriendRequestsComponent";
import SignedInNavbar from "./SignedInNavbar";

const FriendRequestsContainer = (props: { user: User; uuid: UUID }) => {
  const [user, setUser] = useState<User>(props.user);

  useWebsockets(props.uuid, user || props.user, setUser);

  return (
    <>
      <SignedInNavbar user={user || props.user} setUser={setUser} />
      <FriendRequestsComponent user={user || props.user} setUser={setUser} />
    </>
  );
};

export default FriendRequestsContainer;
