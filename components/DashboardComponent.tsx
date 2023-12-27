"use client";

import styles from "@/styles/dashboard.module.css";
import { decryptString } from "@/utils/encryption";
import { User } from "@/utils/redis";
import { renderChatMessage } from "@/utils/utils";
import { UUID } from "crypto";
import Image from "next/image";
import Link from "next/link";
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
  function getDisplayNameFromID(id: string) {
    return (
      JSON.parse(decryptString(usernamesWithIDs, true)) as {
        name: string;
        displayName: string;
        id: UUID;
      }[]
    ).find((usernameWithID) => usernameWithID.id === id)?.displayName;
  }

  function getProfilePictureFromID(id: string) {
    return (
      JSON.parse(decryptString(usernamesWithIDs, true)) as {
        name: string;
        displayName: string;
        id: UUID;
        profilePicture: string;
      }[]
    ).find((usernameWithID) => usernameWithID.id === id)?.profilePicture;
  }

  function shortenMessage(message: string) {
    const maxLength = 11;
    if (message.length > maxLength) {
      let truncatedStr = message.substring(0, maxLength);

      if (truncatedStr[maxLength - 1] === " ") {
        return truncatedStr.trim() + "...";
      }

      const restOfStr = message.substring(maxLength, message.length);

      if (restOfStr.length < 4) {
        return message;
      }

      if (restOfStr.includes(" ") && restOfStr.indexOf(" ") < 5) {
        return truncatedStr + restOfStr.split(" ")[0] + "...";
      }

      return truncatedStr + "...";
    } else {
      return message;
    }
  }

  return (
    <>
      <div className={styles.page}>
        <h1 className={styles.title}>Recent chats</h1>
        {user?.chats.length === 0 && (
          <p className={styles["no-recent-chats"]}>Nothing to show here...</p>
        )}
        <div className={styles["recent-chats"]}>
          {user.chats.map((chat) => (
            <Link
              href={`/dashboard/chats/${chat.id}`}
              key={chat.id}
              className={styles["recent-chat"]}
            >
              <div className={styles["chat-with-user-container"]}>
                <Image
                  src={String(getProfilePictureFromID(chat.withID))}
                  alt="Logo"
                  height={35}
                  width={35}
                />
                <p>{getDisplayNameFromID(chat.withID)}</p>
              </div>
              <p className={styles["most-recent-message"]}>
                <b>{chat.messages.at(-1)?.fromYou && "You: "}</b>
                {shortenMessage(
                  renderChatMessage(chat.messages.at(-1)?.message!)
                )}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardComponent;
