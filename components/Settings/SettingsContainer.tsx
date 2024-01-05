"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { ProtectedPageContainerPropsType } from "@/types/ComponentTypes";
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { useState } from "react";
import SignedInNavbar from "../Navbar/SignedInNavbar";
import SettingsComponent from "./SettingsComponent";

const SettingsContainer = (props: ProtectedPageContainerPropsType) => {
  const [user, setUser] = useState<UserType>(props.user);
  const [usernamesList, setUsernamesList] = useState<UserDetailsList>(
    props.usernamesList
  );

  useWebsockets(props.userKey, user, setUser, usernamesList);

  return (
    <>
      <SignedInNavbar
        usernamesList={usernamesList}
        user={user}
        userKey={props.userKey}
        setUser={setUser}
        setUsernamesList={setUsernamesList}
      />
      <SettingsComponent
        userKey={props.userKey}
        usernamesList={usernamesList}
        user={user}
        setUser={setUser}
        setUsernamesList={setUsernamesList}
      />
    </>
  );
};

export default SettingsContainer;
