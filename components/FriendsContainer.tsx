"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { User } from "@/utils/redis";
import { UUID } from "crypto";
import { useState } from "react";
import FriendsComponent from "./FriendsComponent";
import SignedInNavbar from "./SignedInNavbar";

const FriendsContainer = (props: { user: User; uuid: UUID }) => {
  const [user, setUser] = useState<User>(props.user);

  useWebsockets(props.uuid, user || props.user, setUser);

  return (
    <>
      <SignedInNavbar user={user || props.user} setUser={setUser} />
      <FriendsComponent user={user || props.user} setUser={setUser} />
    </>
  );
};

export default FriendsContainer;