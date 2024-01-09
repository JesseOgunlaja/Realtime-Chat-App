import { StylesType } from "@/types/ComponentTypes";
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { getDisplayNameFromID, getProfilePictureFromID } from "@/utils/utils";
import { UUID } from "crypto";
import { LogOut, Menu, MessagesSquare, Settings, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type PropsType = {
  styles: StylesType;
  logout: () => Promise<void>;
  user: UserType;
  // eslint-disable-next-line no-unused-vars
  hideChat(e: MouseEvent, chatID: UUID): Promise<void>;
  userDetailsList: UserDetailsList;
};

const MobileSignedInNavbar = ({
  styles,
  logout,
  user,
  hideChat,
  userDetailsList,
}: PropsType) => {
  const [mobileNavbarVisibility, setMobileNavbarVisibility] =
    useState<boolean>(false);

  return (
    <div
      style={{
        minHeight: mobileNavbarVisibility ? "150vh" : "0vh",
        overflowY: mobileNavbarVisibility ? "scroll" : "hidden",
      }}
      className={styles["mobile-nav-container"]}
    >
      <div className={styles["top-bar"]}>
        <Link href="/chats" onClick={() => setMobileNavbarVisibility(false)}>
          <Image
            loading="eager"
            priority
            className={styles.logo2}
            src="/favicon.ico"
            height={50}
            width={50}
            alt="Website logo"
          />
        </Link>
        {mobileNavbarVisibility ? (
          <X onClick={() => setMobileNavbarVisibility(false)} />
        ) : (
          <Menu onClick={() => setMobileNavbarVisibility(true)} />
        )}
      </div>
      <nav
        style={{
          opacity: mobileNavbarVisibility ? "1" : "0",
          visibility: mobileNavbarVisibility ? "visible" : "hidden",
        }}
        className={styles.nav2}
      >
        <p className={styles.overview}>Overview</p>
        <div className={styles["overview-tabs"]}>
          <Link
            href="/chats"
            onClick={() => setMobileNavbarVisibility(false)}
            className={styles["friends"]}
          >
            <span className={styles["overview-logo"]}>
              <MessagesSquare />
            </span>
            <div className={styles["overview-text"]}>Chats</div>
          </Link>

          <Link
            href="/friends"
            onClick={() => setMobileNavbarVisibility(false)}
            className={styles["friends"]}
          >
            <span className={styles["overview-logo"]}>
              <Users />
            </span>
            <div className={styles["overview-text"]}>Friends {"  "}</div>
            {user.incomingFriendRequests.length !== 0 && (
              <span className={styles["pending-friend-requests"]}>
                {user.incomingFriendRequests.length}
              </span>
            )}
          </Link>

          <Link
            href="/settings"
            onClick={() => setMobileNavbarVisibility(false)}
            className={styles["settings"]}
          >
            <span className={styles["overview-logo"]}>
              <Settings />
            </span>
            {"  "}
            <div className={styles["overview-text"]}>
              <span>Settings</span>
            </div>
          </Link>
        </div>

        <p className={styles["chats-text"]}>Chats</p>
        <div className={styles.chats}>
          {user.chats
            .filter((chat) => chat.visible)
            .map((chat) => (
              <Link
                onClick={() => setMobileNavbarVisibility(false)}
                href={`/chats/${chat.id}`}
                className={styles.chat}
                key={chat.id}
              >
                <Image
                  src={String(
                    getProfilePictureFromID(userDetailsList, chat.withID)
                  )}
                  priority
                  loading="eager"
                  alt="Profile Picture"
                  height={22.5}
                  width={22.5}
                />
                {getDisplayNameFromID(userDetailsList, chat.withID)}
                <X
                  onClick={(e) => hideChat(e as unknown as MouseEvent, chat.id)}
                />
              </Link>
            ))}
        </div>
        <div className={styles["user-snippet"]}>
          <div className={styles["user-details-container"]}>
            <Image
              loading="eager"
              priority
              src={user.profilePicture}
              alt="Profile Picture"
              height={40}
              width={40}
            />
            <p className={styles["display-name"]}>{user.displayName}</p>
          </div>
          <LogOut onClick={logout} />
        </div>
      </nav>
    </div>
  );
};

export default MobileSignedInNavbar;
