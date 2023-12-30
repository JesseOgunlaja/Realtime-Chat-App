"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { DashboardPageContainerPropsType } from "@/types/ComponentTypes";
import { UserType } from "@/types/UserTypes";
import { useState } from "react";
import SettingsComponent from "./SettingsComponent";
import SignedInNavbar from "./SignedInNavbar";

const SettingsContainer = (props: DashboardPageContainerPropsType) => {
  const [user, setUser] = useState<UserType>(props.user);

  useWebsockets(props.uuid, user, setUser, props.usernamesWithIDs);

  return (
    <>
      <SignedInNavbar
        usernamesWithIDs={props.usernamesWithIDs}
        user={user}
        setUser={setUser}
      />
      <SettingsComponent user={user} setUser={setUser} />
    </>
  );
};

export default SettingsContainer;
