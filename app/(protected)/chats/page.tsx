"use client";

import styles from "@/styles/chats.module.css";
import { Message } from "@/types/UserTypes";
import {
  getDisplayNameFromID,
  getProfilePictureFromID,
  renderChatMessage,
} from "@/utils/utils";
import { getUser, getUserDetailsList } from "@/utils/zustand";
import Image from "next/image";
import Link from "next/link";

const ChatsComponent = () => {
  const user = getUser();
  const userDetailsList = getUserDetailsList();

  return (
    <>
      <div className={styles.page}>
        <h1 className={styles.title}>Recent chats</h1>
        {user.chats
          .filter((chat) => chat.visible)
          .filter((chat) => chat.messages.at(-1)).length === 0 && (
          <p className={styles["no-recent-chats"]}>Nothing to show here...</p>
        )}
        <div className={styles["recent-chats"]}>
          {user.chats.map(
            (chat) =>
              chat.messages.at(-1) &&
              chat.visible && (
                <Link
                  href={`/chats/${chat.id}`}
                  key={chat.id}
                  className={styles["recent-chat"]}
                >
                  <Image
                    src={String(
                      getProfilePictureFromID(userDetailsList, chat.withID)
                    )}
                    priority
                    loading="eager"
                    alt="Profile Picture"
                    height={47.5}
                    width={47.5}
                  />
                  <div className={styles["message-and-username"]}>
                    <p>{getDisplayNameFromID(userDetailsList, chat.withID)}</p>
                    <p className={styles["most-recent-message"]}>
                      <span style={{ fontWeight: 400 }}>
                        {chat.messages.at(-1)?.fromYou && "You: "}
                      </span>
                      {renderChatMessage(
                        (chat.messages.at(-1) as Message).message
                      )}
                    </p>
                  </div>
                </Link>
              )
          )}
        </div>
      </div>
    </>
  );
};

export default ChatsComponent;
