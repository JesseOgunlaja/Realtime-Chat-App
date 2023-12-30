"use client";

import styles from "@/styles/friends.module.css";
import { DashboardPageComponentPropsType } from "@/types/ComponentTypes";
import { UserType } from "@/types/UserTypes";
import { decryptString } from "@/utils/encryption";
import { getNewReference } from "@/utils/utils";
import { UUID } from "crypto";
import { MessageSquare, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";

const FriendsComponent = ({
  user,
  setUser,
  usernamesWithIDs,
}: DashboardPageComponentPropsType) => {
  const [popupVisibility, setPopupVisibility] = useState(
    user.friends.map(() => false)
  );
  const friendBeingDeletedID = useRef<UUID>();
  const dialog = useRef<HTMLDialogElement>(null);

  window.onclick = (e) => {
    const clickedElement = e.target as HTMLElement;
    const clickedElementClassname = clickedElement.className as
      | string
      | {
          baseVal: string;
        };

    if (
      !clickedElementClassname ||
      (typeof clickedElementClassname !== "string" &&
        clickedElementClassname.baseVal !== "lucide lucide-more-vertical")
    ) {
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
    const currentUser = getNewReference(user) as UserType;
    currentUser.chats.splice(
      user.chats.findIndex(
        (chat) => chat.withID === friendBeingDeletedID.current
      ),
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

  function getFriendDataFromID(id: UUID) {
    return (
      JSON.parse(decryptString(usernamesWithIDs, true)) as {
        name: string;
        displayName: string;
        id: UUID;
        profilePicture: string;
      }[]
    ).find((usernameWithID) => usernameWithID.id === id);
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
        {user.friends.map((friend, index) => (
          <div key={friend.id} className={styles.friend}>
            <Link
              href={`/dashboard/chats/${
                user.chats[
                  user.chats.findIndex((chat) => chat.withID === friend.id)
                ].id
              }`}
            >
              <Image
                height={35}
                width={35}
                src={getFriendDataFromID(friend.id)?.profilePicture as string}
                alt="Friend profile picture"
              />
              <p>{getFriendDataFromID(friend.id)?.displayName}</p>
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
