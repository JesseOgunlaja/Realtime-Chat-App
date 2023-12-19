"use client";
import styles from "@/styles/friends.module.css";
import { User } from "@/utils/redis";
import { UUID } from "crypto";
import { MessageSquare, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Dispatch, useRef, useState } from "react";
import Avatar from "react-avatar";
import { toast } from "sonner";

const FriendsComponent = ({
  user,
  setUser,
}: {
  user: User;
  setUser: Dispatch<User>;
}) => {
  const [popupVisibility, setPopupVisibility] = useState(
    user?.friends.map(() => false)
  );
  const friendBeingDeletedID = useRef<UUID>();
  const dialog = useRef<HTMLDialogElement>(null);

  window.onclick = (e) => {
    const clickedElement = e.target as any;

    if (!clickedElement?.className) {
      const newVisibility = [...popupVisibility];
      newVisibility.fill(false);
      setPopupVisibility(newVisibility);
      return;
    }

    if (clickedElement?.className?.baseVal !== "lucide lucide-more-vertical") {
      const newVisibility = [...popupVisibility];
      newVisibility.fill(false);
      setPopupVisibility(newVisibility);
    }
  };

  function togglePopupVisibility(e: MouseEvent, index: number) {
    e.preventDefault();

    const newVisibility = [...popupVisibility].map((visibility, popupIndex) => {
      if (popupIndex === index) {
        return visibility;
      }
      return false;
    });

    newVisibility[index] = !newVisibility[index];
    setPopupVisibility(newVisibility);
  }

  async function removeFriend() {
    hideModal();
    const currentUser = JSON.parse(JSON.stringify(user)) as User;
    currentUser.chats.splice(
      user.chats.findIndex((chat) => chat.id === friendBeingDeletedID.current),
      1
    );
    currentUser.friends.splice(
      user.friends.findIndex(
        (friend) => friend.id === friendBeingDeletedID.current
      ),
      1
    );
    const loadingToastID = toast.loading("Loading", { duration: Infinity });
    setUser(currentUser);
    const res = await fetch("/api/friends/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: friendBeingDeletedID.current,
      }),
    });
    const data = await res.json();

    if (data.message !== "Success") {
      toast.error("An unexpected error occurred. Please try again.", {
        id: loadingToastID,
      });
      setUser(user);
    } else {
      toast.success("Success", {
        id: loadingToastID,
      });
    }
    setTimeout(() => {
      toast.dismiss(loadingToastID);
    }, 1000);
  }

  function hideModal() {
    dialog.current?.close();
    dialog.current!.style.display = "none";
  }

  return (
    <div className={styles.page}>
      <dialog ref={dialog} className={styles.dialog}>
        <div>
          <p>Are you sure?</p>
          <p>This will remove your chat history with them.</p>
          <div className={styles.bottomButton}>
            <button className={styles.back} onClick={hideModal}>
              No
            </button>
            <button className={styles.delete} onClick={removeFriend}>
              Yes
            </button>
          </div>
        </div>
      </dialog>
      <h1 className={styles.title}>Friends</h1>
      <div className={styles.friends}>
        {user.friends.length === 0 ? (
          <p className={styles["no-friends"]}>No friends...</p>
        ) : null}
        {user?.friends.map((friend, index) => (
          <div key={friend.id} className={styles.friend}>
            <Link
              href={`/dashboard/chats/${
                user.chats[
                  user.chats.findIndex((chat) => chat.withID === friend.id)
                ].id
              }`}
            >
              <Avatar
                name={friend.username}
                round
                size="40"
                textSizeRatio={1.5}
              />
              <p>{friend.alias}</p>
              <MessageSquare />
              <MoreVertical
                onClick={(e) =>
                  togglePopupVisibility(e as unknown as MouseEvent, index)
                }
              />
            </Link>
            <div
              style={{ display: popupVisibility[index] ? "block" : "none" }}
              className={styles.popup}
            >
              <Link
                href={`/dashboard/chats/${
                  user.chats[
                    user.chats.findIndex((chat) => chat.withID === friend.id)
                  ].id
                }`}
              >
                Open chat
              </Link>
              <p
                onClick={() => {
                  dialog.current?.show();
                  dialog.current!.style.display = "flex";
                  friendBeingDeletedID.current = friend.id;
                }}
              >
                Remove friend
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsComponent;
