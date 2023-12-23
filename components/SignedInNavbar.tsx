"use client";
import styles from "@/styles/signed-in-navbar.module.css";
import { User as UserType } from "@/utils/redis";
import { getNewReference } from "@/utils/utils";
import { UUID } from "crypto";
import { LogOut, Menu, UserCog, UserPlus, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, useState } from "react";

const SignedInNavbar = ({
  user,
  setUser,
}: {
  user: UserType;
  setUser: Dispatch<UserType>;
}) => {
  const [mobileNavbarVisibility, setMobileNavbarVisibility] =
    useState<boolean>(false);

  async function hideChat(e: MouseEvent, chatID: UUID, index: number) {
    e.preventDefault();
    const currentUser = getNewReference(user) as UserType;
    currentUser.chats[index].visible = false;
    setUser(currentUser);
    const res = await fetch("/api/chat/hide", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatID,
      }),
    });
    const data = await res.json();
    if (data.message !== "Success") setUser(user);
  }

  return (
    <>
      <style jsx global>{`
        body {
          overflow: ${mobileNavbarVisibility ? "hidden" : "auto"};
        }
      `}</style>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      ></link>
      <nav className={styles.nav}>
        <Link href="/dashboard">
          <Image
            loading="eager"
            priority
            className={styles.logo}
            src="/logo.png"
            height={50}
            width={50}
            alt="Website logo"
          />
        </Link>
        <p className={styles["chats-text"]}>Chats</p>
        <div className={styles.chats}>
          {user?.chats
            .filter((chat) => chat.visible)
            .map((chat, index) => (
              <Link
                href={`/dashboard/chats/${chat.id}`}
                className={styles.chat}
                key={chat.id}
              >
                {chat.with}
                <X
                  onClick={(e) =>
                    hideChat(e as unknown as MouseEvent, chat.id, index)
                  }
                />
              </Link>
            ))}
        </div>
        <p className={styles.overview}>Overview</p>
        <div className={styles["overview-tabs"]}>
          <Link href="/dashboard/friends" className={styles["friends"]}>
            <span className={styles["friends-logo"]}>
              <Users />
            </span>
            <div className={styles["friends-text"]}>Friends</div>
          </Link>
          <Link href="/dashboard/add-friend" className={styles["add-friend"]}>
            <span className={styles["add-friend-logo"]}>
              <UserPlus />
            </span>
            <div className={styles["add-friend-text"]}>Add friend</div>
          </Link>

          <Link
            href="/dashboard/friend-requests"
            className={styles["friend-requests"]}
          >
            <span className={styles["friend-request-logo"]}>
              <Users />
            </span>
            {"  "}
            <div className={styles["friend-request-text"]}>
              <span>Friend requests</span>
              {"  "}
              {user && user?.incomingFriendRequests.length !== 0 && (
                <span className={styles["pending-friend-requests"]}>
                  {user?.incomingFriendRequests.length}
                </span>
              )}
            </div>
          </Link>

          <Link href="/dashboard/settings" className={styles["settings"]}>
            <span className={styles["settings-logo"]}>
              <UserCog />
            </span>
            {"  "}
            <div className={styles["settings-text"]}>
              <span>Settings</span>
            </div>
          </Link>
        </div>

        <div className={styles["user-snippet"]}>
          <p className={styles["display-name"]}>{user?.displayName}</p>
          <LogOut />
        </div>
      </nav>
      <div className={styles["mobile-nav-container"]}>
        <div className={styles["top-bar"]}>
          <Link href="/dashboard">
            <Image
              loading="eager"
              priority
              className={styles.logo2}
              src="/logo.png"
              height={50}
              width={50}
              alt="Website logo"
            />
          </Link>
          {mobileNavbarVisibility ? (
            <X
              onClick={() => setMobileNavbarVisibility(!mobileNavbarVisibility)}
            />
          ) : (
            <Menu
              onClick={() => setMobileNavbarVisibility(!mobileNavbarVisibility)}
            />
          )}
        </div>
        <nav
          style={{
            opacity: mobileNavbarVisibility ? "1" : "0",
            visibility: mobileNavbarVisibility ? "visible" : "hidden",
          }}
          className={styles.nav2}
        >
          <p className={styles["chats-text"]}>Chats</p>
          <div className={styles.chats}>
            {user?.chats
              .filter((chat) => chat.visible)
              .map((chat) => (
                <Link
                  onClick={() => setMobileNavbarVisibility(false)}
                  href={`/dashboard/chats/${chat.id}`}
                  className={styles.chat}
                  key={chat.id}
                >
                  {chat.with}
                </Link>
              ))}
          </div>
          <p className={styles.overview}>Overview</p>
          <div className={styles["overview-tabs"]}>
            <Link
              onClick={() => setMobileNavbarVisibility(false)}
              href="/dashboard/friends"
              className={styles["friends"]}
            >
              <span className={styles["friends-logo"]}>
                <Users />
              </span>
              <div className={styles["friends-text"]}>Friends</div>
            </Link>
            <Link
              onClick={() => setMobileNavbarVisibility(false)}
              href="/dashboard/add-friend"
              className={styles["add-friend"]}
            >
              <span className={styles["add-friend-logo"]}>
                <UserPlus />
              </span>
              <div className={styles["add-friend-text"]}>Add friend</div>
            </Link>

            <Link
              onClick={() => setMobileNavbarVisibility(false)}
              href="/dashboard/friend-requests"
              prefetch={false}
              className={styles["friend-requests"]}
            >
              <span className={styles["friend-request-logo"]}>
                <Users />
              </span>
              {"  "}
              <div className={styles["friend-request-text"]}>
                <span>Friend requests</span>
                {"  "}
                {user?.incomingFriendRequests.length !== 0 && (
                  <span className={styles["pending-friend-requests"]}>
                    {user?.incomingFriendRequests.length}
                  </span>
                )}
              </div>
            </Link>
            <Link
              onClick={() => setMobileNavbarVisibility(false)}
              href="/dashboard/settings"
              className={styles["settings"]}
            >
              <span className={styles["settings-logo"]}>
                <UserCog />
              </span>
              {"  "}
              <div className={styles["settings-text"]}>
                <span>Settings</span>
              </div>
            </Link>
          </div>
          <div className={styles["user-snippet"]}>
            <p className={styles["display-name"]}>{user?.displayName}</p>
            <LogOut />
          </div>
        </nav>
      </div>
    </>
  );
};

export default SignedInNavbar;
