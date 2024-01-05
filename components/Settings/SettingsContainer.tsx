"use client";

import { useWebsockets } from "@/hooks/useWebsockets";
import { ProtectedPageContainerPropsType } from "@/types/ComponentTypes";
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { useState } from "react";
import SignedInNavbar from "../Navbar/SignedInNavbar";
import SettingsComponent from "./SettingsComponent";

const SettingsContainer = (props: ProtectedPageContainerPropsType) => {
  const [user, setUser] = useState<UserType>(props.user);
  const [userDetailsList, setUserDetailsList] = useState<UserDetailsList>(
    props.userDetailsList
  );

  useWebsockets(props.userKey, user, setUser, userDetailsList);

  return (
    <>
      <SignedInNavbar
        userDetailsList={userDetailsList}
        user={user}
        userKey={props.userKey}
        setUser={setUser}
        setUserDetailsList={setUserDetailsList}
      />
      <SettingsComponent
        userKey={props.userKey}
        userDetailsList={userDetailsList}
        user={user}
        setUser={setUser}
        setUserDetailsList={setUserDetailsList}
      />
    </>
  );
};

export default SettingsContainer;
