"use client";

import styles from "@/styles/settings.module.css";
import { User } from "@/utils/redis";
import { Dispatch } from "react";
import UsernameSettingsComponent from "./UsernameSettingsComponent";

const SettingsComponent = ({
  user,
  setUser,
}: {
  user: User;
  setUser: Dispatch<User>;
}) => {
  return (
    <div className={styles.page}>
      <style jsx global>{`
        body {
          justify-content: flex-start;
        }
      `}</style>
      <h1>Settings</h1>
      <UsernameSettingsComponent
        user={user}
        setUser={setUser}
        styles={styles}
      />
    </div>
  );
};

export default SettingsComponent;
