"use client";
import styles from "@/styles/chat.module.css";
import { User } from "@/utils/redis";
import { containsEmoji } from "@/utils/utils";
import { UUID } from "crypto";
import { format } from "date-fns";
import { Pencil, Reply, SendHorizontal, Trash2 } from "lucide-react";
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
  const [popupVisibility, setPopupVisibility] = useState<boolean[]>(
    user.chats[chatIndex].messages.map(() => false)
  );
  const messages = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const messageBeingEditedIndex = useRef<number>(-1);

  useEffect(() => {
    messages.current!.scrollTop = messages.current!.scrollHeight;
  }, [user]);

  window.onclick = (e) => {
    const clickedElement = e.target as any;
    if (
      !clickedElement.className ||
      typeof clickedElement.className !== "string" ||
      !clickedElement.className?.includes("message") ||
      clickedElement.className?.includes("messages")
    ) {
      const newVisibility = [...popupVisibility];
      newVisibility.fill(false);
      setPopupVisibility(newVisibility);
    }
  };

  async function sendMessage(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();

    if (message === "") return;

    const currentUser = JSON.parse(JSON.stringify(user)) as User;
    const timestamp = Date.now();
    currentUser.chats[chatIndex as number].messages.push({
      message: message.replaceAll("’", "'"),
      fromYou: true,
      timestamp,
      uuid: null as never,
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
        timestamp,
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
    } else {
      currentUser.chats[chatIndex as number].messages.pop();
      currentUser.chats[chatIndex as number].messages.push({
        message: message.replaceAll("’", "'"),
        fromYou: true,
        timestamp,
        uuid: data.messageID,
      });
      setUser(JSON.parse(JSON.stringify(currentUser)));
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

  function togglePopupVisibility(index: number) {
    const currentVisibility = [...popupVisibility].map(
      (visibility, popupIndex) => {
        if (popupIndex === index) {
          return visibility;
        }
        return false;
      }
    );

    currentVisibility[index] = !currentVisibility[index];
    setPopupVisibility(currentVisibility);
  }

  function showEditMessageBox(index: number) {
    messageBeingEditedIndex.current = index;
    dialog.current?.show();
    dialog.current!.style.display = "flex";
  }

  function hideEditMessageBox() {
    dialog.current?.close();
    dialog.current!.style.display = "none";
  }

  async function editMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());

    if (formValues["new-message"] === "") return;

    const currentUser = JSON.parse(JSON.stringify(user)) as User;

    currentUser.chats[chatIndex].messages[
      messageBeingEditedIndex.current
    ].message = (formValues["new-message"] as string).replaceAll("’", "'");
    setUser(currentUser);
    hideEditMessageBox();

    const res = await fetch("/api/chat/message/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatID,
        message:
          user.chats[chatIndex].messages[messageBeingEditedIndex.current],
        newMessage: formValues["new-message"],
      }),
    });
    const data = await res.json();

    if (data.message !== "Success") {
      toast.error(
        "An unexpected error occured, while trying to edit the message."
      );
      showEditMessageBox(messageBeingEditedIndex.current);
      setUser(user);
    } else {
      toast.success("Success");
    }
  }

  return (
    <div className={styles.page}>
      <dialog ref={dialog} className={styles.dialog}>
        <div>
          <p>Edit Message</p>
          <form onSubmit={editMessage}>
            <input
              type="text"
              key={messageBeingEditedIndex.current}
              name="new-message"
              defaultValue={
                user?.chats[chatIndex]?.messages[
                  messageBeingEditedIndex.current
                ]?.message
              }
            />
            <input type="submit" />
          </form>
          <button onClick={hideEditMessageBox} className={styles.bottomButton}>
            Back
          </button>
        </div>
      </dialog>
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
              onClick={() => togglePopupVisibility(index)}
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
              <div
                style={{ display: popupVisibility[index] ? "flex" : "none" }}
                className={
                  styles[
                    `${
                      message.fromYou
                        ? "my-message-popup"
                        : "other-message-popup"
                    }`
                  ]
                }
              >
                {message.fromYou ? (
                  <button onClick={() => showEditMessageBox(index)}>
                    <Pencil /> Edit
                  </button>
                ) : (
                  <button>
                    <Reply />
                    Reply
                  </button>
                )}
                <button>
                  <Trash2 />
                  Delete
                </button>
              </div>
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
        <SendHorizontal onClick={() => sendMessage(undefined)} />
      </form>
    </div>
  );
};

export default ChatComponent;
