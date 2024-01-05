import { StylesType } from "@/types/ComponentTypes";
import { DispatchUserType, UserType } from "@/types/UserTypes";
import { getNewReference, removeUndefinedFromObject } from "@/utils/utils";
import { UUID } from "crypto";
import { SendHorizontal, X } from "lucide-react";
import { Dispatch, RefObject, SetStateAction, useState } from "react";
import { toast } from "sonner";

type PropsType = {
  setUser: DispatchUserType;
  setMessageBeingRepliedID: Dispatch<SetStateAction<UUID | undefined>>;
  messageBeingRepliedID: UUID | undefined;
  styles: StylesType;
  user: UserType;
  chatIndex: number;
  messagesContainer: RefObject<HTMLDivElement>;
  chatID: UUID;
  sendMessageBox: RefObject<HTMLTextAreaElement>;
  chatWithDisplayName: string;
};

const SendMessageForm = ({
  user,
  messagesContainer,
  chatWithDisplayName,
  sendMessageBox,
  chatID,
  setUser,
  chatIndex,
  messageBeingRepliedID,
  setMessageBeingRepliedID,
  styles,
}: PropsType) => {
  const [message, setMessage] = useState<string>("");

  async function sendMessage() {
    if (message === "") return;

    const currentUser = getNewReference(user) as UserType;
    const timestamp = Date.now();
    currentUser.chats[chatIndex as number].messages.push(
      removeUndefinedFromObject({
        message: message.replaceAll("’", "'"),
        fromYou: true,
        timestamp,
        id: null as never,
        replyID: messageBeingRepliedID,
      })
    );
    currentUser.chats[chatIndex as number].visible = true;
    setMessageBeingRepliedID(undefined);
    setMessage("");
    setUser(currentUser);
    messagesContainer.current!.scrollTop =
      messagesContainer.current!.scrollHeight;

    const res = await fetch("/api/chat/message/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        chatID: chatID,
        replyID: messageBeingRepliedID,
      }),
    });
    const data = await res.json();
    if (data.message !== "Success") {
      setUser(user);
      setMessage(message);
      toast.error(
        "An unexpected error occured, while trying to send the message."
      );
    } else {
      currentUser.chats[chatIndex as number].messages.pop();
      currentUser.chats[chatIndex as number].messages.push(
        removeUndefinedFromObject({
          message: message.replaceAll("’", "'"),
          fromYou: true,
          timestamp,
          id: data.messageID,
          replyID: messageBeingRepliedID,
        })
      );
      setUser(getNewReference(currentUser));
    }
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
