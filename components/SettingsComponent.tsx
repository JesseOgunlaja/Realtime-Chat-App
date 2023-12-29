"use client";

import styles from "@/styles/settings.module.css";
import { DashboardPageComponentPropsType } from "@/types/ComponentTypes";
import DisplayNameSettingsComponent from "./DisplayNameSettingsComponent";
import PasswordSettingsComponent from "./PasswordSettingsComponent";
import UsernameSettingsComponent from "./UsernameSettingsComponent";

const SettingsComponent = ({
  user,
  setUser,
}: Omit<DashboardPageComponentPropsType, "usernamesWithIDs">) => {
  return (
    <div className={styles.page}>
      <h1>Settings</h1>
      <UsernameSettingsComponent
        user={user}
        setUser={setUser}
        styles={styles}
      />
      <br />
      <DisplayNameSettingsComponent
        user={user}
        setUser={setUser}
        styles={styles}
      />
      <br />
      <PasswordSettingsComponent
        user={user}
        setUser={setUser}
        styles={styles}
      />
    </div>
  );
};

export default SettingsComponent;
