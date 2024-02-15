import { generateUUID } from "@/actions/actions";
import { sendMessageAction } from "@/actions/chats/message/send";
import styles from "@/styles/chat.module.css";
import { getUser, getUserKey } from "@/utils/zustand";
import { UUID } from "crypto";
import { SendHorizontal, X } from "lucide-react";
import { Dispatch, RefObject, SetStateAction, useState } from "react";

type PropsType = {
  chatWithDisplayName: string;
  sendMessageBox: RefObject<HTMLTextAreaElement>;
  chatIndex: number;
  messageBeingRepliedID: UUID | undefined;
  setMessageBeingRepliedID: Dispatch<SetStateAction<UUID | undefined>>;
};

const SendMessageForm = ({
  chatWithDisplayName,
  sendMessageBox,
  chatIndex,
  messageBeingRepliedID,
  setMessageBeingRepliedID,
}: PropsType) => {
  const user = getUser();
  const userKey = getUserKey();
  const [message, setMessage] = useState<string>("");

  async function sendMessage() {
    if (message === "") return;

    const newMessage = {
      message: message.replaceAll("’", "'"),
      timestamp: Date.now(),
      replyID: messageBeingRepliedID,
      id: await generateUUID(),
    };

    setMessageBeingRepliedID(undefined);
    setMessage("");

    await sendMessageAction(
      userKey,
      user.chats[chatIndex].id,
      user,
      newMessage
    );
  }

  return (
    <form onSubmit={sendMessage} className={styles.form}>
      {messageBeingRepliedID ? (
        <div className={styles["message-being-replied-to"]}>
          <p>
            Replying to{" "}
            <b>
              {user.chats[chatIndex].messages.find(
                (message) => message.id === messageBeingRepliedID
              )?.fromYou
                ? "Yourself"
                : chatWithDisplayName}
            </b>
          </p>
          <X onClick={() => setMessageBeingRepliedID(undefined)} />
        </div>
      ) : null}
      <textarea
        ref={sendMessageBox}
        value={message}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        placeholder={`Message ${chatWithDisplayName}`}
      />
      <SendHorizontal onClick={() => sendMessage()} />
    </form>
  );
};

export default SendMessageForm;
