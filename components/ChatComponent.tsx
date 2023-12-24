"use client";
import { usePreviousValue } from "@/hooks/usePreviousValue";
import styles from "@/styles/chat.module.css";
import { decryptString } from "@/utils/encryption";
import { User } from "@/utils/redis";
import {
  containsEmoji,
  getFormValues,
  getNewReference,
  removeUndefinedFromObject,
} from "@/utils/utils";
import { UUID } from "crypto";
import { format } from "date-fns";
import { Pencil, Reply, SendHorizontal, Trash2, X } from "lucide-react";
import { Dispatch, FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ChatComponent = ({
  user,
  setUser,
  uuid,
  chatID,
  chatIndex,
  usernamesWithIDs,
}: {
  user: User;
  setUser: Dispatch<User>;
  uuid: UUID;
  chatID: UUID;
  chatIndex: number;
  usernamesWithIDs: string;
}) => {
  const prevUser = usePreviousValue(user);
  const chatWith = (
    JSON.parse(decryptString(usernamesWithIDs, true)) as {
      name: string;
      displayName: string;
      id: UUID;
    }[]
  ).find(
    (usernameWithID) => usernameWithID.id === user.chats[chatIndex].withID
  )?.displayName;
  const [message, setMessage] = useState<string>("");
  const [popupVisibility, setPopupVisibility] = useState<boolean[]>(
    user.chats[chatIndex].messages.map(() => false)
  );
  const messagesContainer = useRef<HTMLDivElement>(null);
  const sendMessageBox = useRef<HTMLTextAreaElement>(null);
  const editMessageBox = useRef<HTMLInputElement>(null);

  const dialog = useRef<HTMLDialogElement>(null);
  const dialog2 = useRef<HTMLDialogElement>(null);

  const messageBeingEditedID = useRef<UUID>();
  const messageBeingDeletedID = useRef<UUID>();
  const [messageBeingRepliedID, setMessageBeingRepliedID] = useState<UUID>();
  const [messageBeingScrolledToIndex, setMessageBeingScrolledToIndex] =
    useState<number>();

  useEffect(() => {
    if (
      !prevUser ||
      prevUser.chats[chatIndex].messages.length !==
        user.chats[chatIndex].messages.length
    ) {
      messagesContainer.current!.scrollTop =
        messagesContainer.current!.scrollHeight;
    }
  }, [user]);

  window.onclick = (e) => {
    const container = messagesContainer.current;
    if (container) {
      const elementClicked = e.target as any;
      const children = Array.from(container.children as HTMLCollection);

      if (
        children.every((el) => {
          return (
            elementClicked.className !== el.className &&
            Array.from(el.children).every((el) => {
              return elementClicked.className !== el.className;
            })
          );
        })
      ) {
        const newVisibility = getNewReference(popupVisibility);
        newVisibility.fill(false);
        setPopupVisibility(newVisibility);
      }
    }
  };

  async function sendMessage(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();

    if (message === "") return;

    const currentUser = getNewReference(user) as User;
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

  function showEditMessageBox(ID: UUID) {
    messageBeingEditedID.current = ID;
    dialog.current?.show();
    dialog.current!.style.display = "flex";
    editMessageBox.current?.focus();
  }

  function hideEditMessageBox() {
    dialog.current?.close();
    dialog.current!.style.display = "none";
  }

  async function editMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formValues = getFormValues(e);

    if (formValues["new-message"] === "") return;

    const currentUser = getNewReference(user) as User;

    currentUser.chats[chatIndex].messages[
      user.chats[chatIndex].messages.findIndex(
        (message) => message.id === messageBeingEditedID.current
      )
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
        messageID: messageBeingEditedID.current,
        newMessage: formValues["new-message"],
      }),
    });
    const data = await res.json();

    if (data.message !== "Success") {
      toast.error(
        "An unexpected error occured, while trying to edit the message."
      );
      showEditMessageBox(messageBeingEditedID.current!);
      setUser(user);
    } else {
      toast.success("Success");
    }
  }

  function showDeleteMessageBox(ID: UUID) {
    messageBeingDeletedID.current = ID;
    dialog2.current?.show();
    dialog2.current!.style.display = "flex";
  }

  function hideDeleteMessageBox() {
    dialog2.current?.close();
    dialog2.current!.style.display = "none";
  }

  async function deleteMessage() {
    const currentUser = getNewReference(user) as User;
    const messageBeingDeletedIndex = user.chats[chatIndex].messages.findIndex(
      (message) => message.id == messageBeingDeletedID.current
    );
    currentUser.chats[chatIndex].messages.splice(messageBeingDeletedIndex, 1);
    setUser(currentUser);
    hideDeleteMessageBox();

    const res = await fetch("/api/chat/message/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatID: chatID,
        messageID: messageBeingDeletedID.current,
      }),
    });
    const data = await res.json();
    if (data.message !== "Success") {
      setUser(user);
      toast.error(
        "An unexpected error occured, while trying to delete the message."
      );
    } else {
      toast.success("Success");
    }
  }

  useEffect(() => {
    if (!messageBeingRepliedID) return;

    const element = messagesContainer.current;

    if (!element) return;

    if (element.scrollHeight - element.scrollTop - element.clientHeight <= 51) {
      messagesContainer.current!.scrollTop =
        messagesContainer.current!.scrollTop + 50;
    }
  }, [messageBeingRepliedID]);

  return (
    <div className={styles.page}>
      <dialog ref={dialog} className={styles.dialog}>
        <div>
          <p>Edit Message</p>
          <form onSubmit={editMessage}>
            <input
              type="text"
              ref={editMessageBox}
              key={messageBeingEditedID.current}
              name="new-message"
              defaultValue={
                user?.chats[chatIndex]?.messages[
                  user.chats[chatIndex].messages.findIndex(
                    (message) => message.id === messageBeingEditedID.current
                  )
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
      <dialog ref={dialog2} className={styles.dialog}>
        <div>
          <p>Are you sure you want to delete this message?</p>
        </div>
        <div className={styles.bottomButton}>
          <button className={styles.back} onClick={hideDeleteMessageBox}>
            No
          </button>
          <button className={styles.delete} onClick={deleteMessage}>
            Yes
          </button>
        </div>
      </dialog>
      <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>
      <div className={styles.header}>
        <p>{chatIndex != undefined ? chatWith : null}</p>
      </div>
      <div className={styles.messages} ref={messagesContainer}>
        {chatIndex != undefined &&
          user != undefined &&
          user?.chats[chatIndex].messages.length !== 0 &&
          user?.chats[chatIndex].messages.map((message, index) => (
            <div
              style={{
                background:
                  message.id === messageBeingRepliedID
                    ? message.fromYou
                      ? "#102823"
                      : "#1b1b1c"
                    : undefined,
              }}
              onClick={() => togglePopupVisibility(index)}
              key={Math.random()}
              className={`${
                styles[`${message.fromYou ? "my-message" : "other-message"}`]
              } ${
                index === messageBeingScrolledToIndex
                  ? styles["message-being-scrolled-to"]
                  : ""
              }`}
            >
              {message.replyID ? (
                <div
                  onClick={() => {
                    const messageBeingRepliedIndex = user.chats[
                      chatIndex
                    ].messages.findIndex(
                      (messageBeingFound) =>
                        messageBeingFound.id === message.replyID
                    );
                    setMessageBeingScrolledToIndex(messageBeingRepliedIndex);
                    setTimeout(() => {
                      setMessageBeingScrolledToIndex(undefined);
                    }, 1050);
                    messagesContainer.current?.children[
                      messageBeingRepliedIndex
                    ].scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={styles["reply-container"]}
                >
                  <p className={styles["reply-to"]}>
                    {user.chats[chatIndex].messages.find(
                      (messageBeingFound) =>
                        messageBeingFound.id === message.replyID
                    )?.fromYou
                      ? "You"
                      : chatWith}
                  </p>
                  <p className={styles["reply-text"]}>
                    {
                      user.chats[chatIndex].messages.find(
                        (messageBeingFound) =>
                          messageBeingFound.id === message.replyID
                      )?.message
                    }
                  </p>
                </div>
              ) : null}
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
                  <>
                    <button onClick={() => showEditMessageBox(message.id)}>
                      <p>Edit</p>
                      <Pencil />
                    </button>
                    <button
                      onClick={() => {
                        sendMessageBox.current?.focus();
                        setMessageBeingRepliedID(message.id);
                      }}
                    >
                      <p>Reply</p>
                      <Reply />
                    </button>
                    <button onClick={() => showDeleteMessageBox(message.id)}>
                      <p>Delete</p>
                      <Trash2 />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      sendMessageBox.current?.focus();
                      setMessageBeingRepliedID(message.id);
                    }}
                  >
                    <p>Reply</p>
                    <Reply />
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
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
                  : chatWith}
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
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            chatIndex != undefined ? `Message ${chatWith}` : "Loading..."
          }
        />
        <SendHorizontal onClick={() => sendMessage(undefined)} />
      </form>
    </div>
  );
};

export default ChatComponent;
