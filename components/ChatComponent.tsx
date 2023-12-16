"use client";
import styles from "@/styles/chat.module.css";
import { User } from "@/utils/redis";
import { containsEmoji } from "@/utils/utils";
import { UUID } from "crypto";
import { format } from "date-fns";
import { SendHorizontal } from "lucide-react";
import { Dispatch, FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ChatComponent = ({
  user,
  setUser,
  uuid,
  chatID,
  chatIndex,
}: {
  user: User;
  setUser: Dispatch<User>;
  uuid: UUID;
  chatID: UUID;
  chatIndex: number;
}) => {
  const [message, setMessage] = useState<string>("");
  const messages = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messages.current!.scrollTop = messages.current!.scrollHeight;
  }, [user]);

  async function sendMessage(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();

    if (message === "") return;

    const currentUser = JSON.parse(JSON.stringify(user)) as User;
    currentUser.chats[chatIndex as number].messages.push({
      message: containsEmoji(message) ? message : message,
      fromYou: true,
      timestamp: Date.now(),
    });
    currentUser.chats[chatIndex as number].visible = true;
    setMessage("");
    setUser(currentUser);
    messages.current!.scrollTop = messages.current!.scrollHeight;

    const res = await fetch("/api/chat/message/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        timestamp: Date.now(),
        chatID: chatID,
      }),
    });
    const data = await res.json();
    if (data.message != "Success") {
      setUser(user);
      setMessage(message);
      toast.error(
        "An unexpected error occured, while trying to send the message."
      );
    }
  }

  function renderChatMessage(message: string) {
    if (containsEmoji(message)) {
      return message.replace(/\\u[\dA-Fa-f]{4}/g, function (match) {
        return String.fromCharCode(parseInt(match.slice(2), 16));
      });
    }
    return message;
  }

  return (
    <div className={styles.page}>
      <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>
      <div className={styles.header}>
        <p>{chatIndex != undefined ? user?.chats[chatIndex].with : null}</p>
      </div>
      <div className={styles.messages} ref={messages}>
        {chatIndex != undefined &&
          user != undefined &&
          user?.chats[chatIndex].messages.length !== 0 &&
          user?.chats[chatIndex].messages.map((message, index) => (
            <div
              key={Math.random()}
              className={
                styles[`${message.fromYou ? "my-message" : "other-message"}`]
              }
            >
              <p className={styles["message-text"]}>
                {renderChatMessage(message.message)}
              </p>
              <p className={styles["message-timestamp"]}>
                {format(message.timestamp, "d MMM | HH:mm")}
              </p>
            </div>
          ))}
      </div>
      <form onSubmit={sendMessage} className={styles.form}>
        <textarea
          value={message}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            chatIndex != undefined
              ? `Message ${user?.chats[chatIndex].with}`
              : "Loading..."
          }
        />
        <SendHorizontal type="submit" />
      </form>
    </div>
  );
};

export default ChatComponent;
