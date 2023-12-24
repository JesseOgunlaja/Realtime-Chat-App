"use client";
import styles from "@/styles/dashboard.module.css";
import { User } from "@/utils/redis";
import { Dispatch } from "react";

const DashboardComponent = ({
  user,
  setUser,
  usernamesWithIDs,
}: {
  user: User;
  setUser: Dispatch<User>;
  usernamesWithIDs: string;
}) => {
  return (
    <>
      <style jsx global>{`
        body {
          justify-content: flex-start;
        }
      `}</style>
      <div className={styles.page}>
        <h1 className={styles.title}>Recent chats</h1>
        {user?.chats.length === 0 && (
          <p className={styles["no-recent-chats"]}>Nothing to show here...</p>
        )}
      </div>
    </>
  );
};

export default DashboardComponent;
