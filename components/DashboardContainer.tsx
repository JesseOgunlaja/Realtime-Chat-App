"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { DashboardPageContainerPropsType } from "@/types/ComponentTypes";
import { UserType } from "@/types/UserTypes";
import { useState } from "react";
import DashboardComponent from "./DashboardComponent";
import SignedInNavbar from "./SignedInNavbar";

const DashboardContainer = (props: DashboardPageContainerPropsType) => {
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
      <DashboardComponent
        usernamesWithIDs={props.usernamesWithIDs}
        user={user || props.user}
        setUser={setUser}
      />
    </>
  );
};

export default DashboardContainer;
