import styles from "@/styles/chats.module.css";
import { ProtectedPageComponentPropsType } from "@/types/ComponentTypes";
import { Message } from "@/types/UserTypes";
import { renderChatMessage } from "@/utils/utils";
import Image from "next/image";
import Link from "next/link";

const ChatsComponent = ({
  user,
  usernamesList,
}: ProtectedPageComponentPropsType) => {
  function getDisplayNameFromID(id: string) {
    return usernamesList.find((usernameWithID) => usernameWithID.id === id)
      ?.displayName;
  }

  function getProfilePictureFromID(id: string) {
    return usernamesList.find((usernameWithID) => usernameWithID.id === id)
      ?.profilePicture;
  }

  function shortenMessage(message: string) {
    const maxLength = 45;
    if (message.length > maxLength) {
      const truncatedStr = message.substring(0, maxLength);

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
                    src={String(getProfilePictureFromID(chat.withID))}
                    alt="Profile Picture"
                    height={47.5}
                    width={47.5}
                  />
                  <div className={styles["message-and-username"]}>
                    <p>{getDisplayNameFromID(chat.withID)}</p>
                    <p className={styles["most-recent-message"]}>
                      <span style={{ fontWeight: 400 }}>
                        {chat.messages.at(-1)?.fromYou && "You: "}
                      </span>
                      {shortenMessage(
                        renderChatMessage(
                          (chat.messages.at(-1) as Message).message
                        )
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
