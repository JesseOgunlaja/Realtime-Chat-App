"use client";

import styles from "@/styles/settings.module.css";
import { DashboardPageComponentPropsType } from "@/types/ComponentTypes";
import DisplayNameSettingsComponent from "./ChangeDisplayName";
import PasswordSettingsComponent from "./ChangePassword";
import UsernameSettingsComponent from "./ChangeUsername";

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
      <br />
    </div>
  );
};

export default SettingsComponent;
