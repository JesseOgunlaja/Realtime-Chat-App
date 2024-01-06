import { usePreviousValue } from "@/hooks/usePreviousValue";
import styles from "@/styles/chat.module.css";
import { ProtectedPageComponentPropsType } from "@/types/ComponentTypes";
import { UserType } from "@/types/UserTypes";
import {
  getNewReference,
  getUserDetailsFromID,
  renderChatMessage,
} from "@/utils/utils";
import { UUID } from "crypto";
import { format } from "date-fns";
import { Pencil, Reply, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Foco from "react-foco";
import Balancer from "react-wrap-balancer";
import { toast } from "sonner";
import SendMessageForm from "./SendMessageForm";

const ChatComponent = ({
  user,
  setUser,
  chatID,
  chatIndex,
  userDetailsList,
}: ProtectedPageComponentPropsType & {
  chatID: UUID;
  chatIndex: number;
}) => {
  const prevUser = usePreviousValue(user);
  const chatWith = getUserDetailsFromID(
    userDetailsList,
    user.chats[chatIndex].withID
  );

  const [popupVisibility, setPopupVisibility] = useState<boolean[]>(
    user.chats[chatIndex].messages.map(() => false)
  );
  const [messageBeingEdited, setMessageBeingEdited] = useState<string>("");

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

  async function editMessage() {
    const currentUser = getNewReference(user) as UserType;

    currentUser.chats[chatIndex].messages[
      user.chats[chatIndex].messages.findIndex(
        (message) => message.id === messageBeingEditedID.current
      )
    ].message = messageBeingEdited.replaceAll("’", "'");
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
        newMessage: messageBeingEdited,
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
    const currentUser = getNewReference(user) as UserType;
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
      <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>
      <dialog ref={dialog} className={styles.dialog}>
        <div>
          <div className={styles["edit-message-top-bar"]}>
            <X onClick={hideEditMessageBox} />
            <p>Edit Message</p>
          </div>
          <div className={styles["edit-message-form-container"]}>
            <div
              ref={(node) => {
                if (node) {
                  setMessageBeingEdited(node.innerText);
                }
              }}
              role="textbox"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  editMessage();
                }
              }}
              onInput={(e) => {
                setMessageBeingEdited((e.target as HTMLDivElement).innerText);
              }}
              key={messageBeingEditedID.current}
              contentEditable={true}
            >
              {
                user.chats[chatIndex]?.messages[
                  user.chats[chatIndex].messages.findIndex(
                    (message) => message.id === messageBeingEditedID.current
                  )
                ]?.message
              }
            </div>
            <button role="form" onClick={() => editMessage()}>
              Submit
            </button>
          </div>
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
      <div className={styles.header}>
        <Image
          src={chatWith.profilePicture}
          alt={`${chatWith.displayName}'s profile picture`}
          height={40}
          width={40}
        />
        <div>
          <p>{chatWith.displayName}</p>
        </div>
      </div>
      <div className={styles.messages} ref={messagesContainer}>
        {user.chats[chatIndex].messages.length !== 0 &&
          user.chats[chatIndex].messages.map((message, index) => (
            <div
              key={message.id}
              className={
                styles[`${message.fromYou ? "my-message" : "other-message"}`]
              }
            >
              <Foco
                onClickOutside={(e) => {
                  const elementClickedClassname = (e.target as HTMLElement)
                    .className;
                  const elementClassNames = [
                    "reply-text",
                    "message-box",
                    "message-text",
                  ];
                  if (
                    popupVisibility[index] &&
                    (typeof elementClickedClassname !== "string" ||
                      elementClassNames.every(
                        (elementClassName) =>
                          !elementClickedClassname.includes(elementClassName)
                      ))
                  ) {
                    const newVisibility = getNewReference(popupVisibility);
                    newVisibility.fill(false);
                    setPopupVisibility(newVisibility);
                  }
                }}
                component={"div"}
              >
                <div
                  onClick={(e) => {
                    if (
                      !(e.target as HTMLElement).className.includes(
                        "reply-text"
                      )
                    ) {
                      togglePopupVisibility(index);
                    }
                  }}
                  style={{
                    background:
                      message.id === messageBeingRepliedID
                        ? message.fromYou
                          ? "#1b1b1c"
                          : "#0045d5"
                        : undefined,
                  }}
                  className={`${styles["message-box"]} ${
                    index === messageBeingScrolledToIndex
                      ? styles["message-being-scrolled-to"]
                      : ""
                  }`}
                >
                  {message.replyID && (
                    <div
                      onClick={() => {
                        const messageBeingRepliedIndex = user.chats[
                          chatIndex
                        ].messages.findIndex(
                          (messageBeingFound) =>
                            messageBeingFound.id === message.replyID
                        );
                        setMessageBeingScrolledToIndex(
                          messageBeingRepliedIndex
                        );
                        setTimeout(() => {
                          setMessageBeingScrolledToIndex(undefined);
                        }, 1050);
                        messagesContainer.current?.children[
                          messageBeingRepliedIndex
                        ].scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                      className={styles["reply-text"]}
                    >
                      {user.chats[chatIndex].messages.find(
                        (messageBeingFound) =>
                          messageBeingFound.id === message.replyID
                      )?.fromYou
                        ? "You"
                        : chatWith.displayName}{" "}
                      &quot;
                      {
                        user.chats[chatIndex].messages.find(
                          (messageBeingFound) =>
                            messageBeingFound.id === message.replyID
                        )?.message
                      }
                      &quot;
                    </div>
                  )}
                  <p className={styles["message-text"]}>
                    <Balancer preferNative={false}>
                      {renderChatMessage(message.message)}
                    </Balancer>
                  </p>
                  <div
                    style={{
                      display: popupVisibility[index] ? "flex" : "none",
                    }}
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
                        <button
                          onClick={() => showDeleteMessageBox(message.id)}
                        >
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
              </Foco>
              <p className={styles["message-timestamp"]}>
                {format(message.timestamp, "hh:mm a")}
              </p>
            </div>
          ))}
      </div>
      <SendMessageForm
        user={user}
        setUser={setUser}
        chatWithDisplayName={chatWith.displayName}
        chatID={chatID}
        chatIndex={chatIndex}
        styles={styles}
        messageBeingRepliedID={messageBeingRepliedID}
        setMessageBeingRepliedID={setMessageBeingRepliedID}
        messagesContainer={messagesContainer}
        sendMessageBox={sendMessageBox}
      />
    </div>
  );
};

export default ChatComponent;
