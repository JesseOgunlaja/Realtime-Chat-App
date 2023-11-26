"use client";
import { User } from "@/utils/redis";
import styles from "@/styles/dashboard.module.css";
import { Dispatch } from "react";

const DashboardComponent = ({
  user,
  setUser,
}: {
  user: User;
  setUser: Dispatch<User>;
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
