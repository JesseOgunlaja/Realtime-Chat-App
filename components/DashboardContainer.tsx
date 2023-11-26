"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { User } from "@/utils/redis";
import { UUID } from "crypto";
import { useState } from "react";
import DashboardComponent from "./DashboardComponent";
import SignedInNavbar from "./SignedInNavbar";

const DashboardContainer = (props: { user: User; uuid: UUID }) => {
  const [user, setUser] = useState<User>(props.user);

  useWebsockets(props.uuid, user || props.user, setUser);

  return (
    <>
      <SignedInNavbar user={user || props.user} setUser={setUser} />
      <DashboardComponent user={user || props.user} setUser={setUser} />
    </>
  );
};

export default DashboardContainer;
