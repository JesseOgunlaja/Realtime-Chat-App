import styles from "@/styles/signed-in-navbar.module.css";
import { ProtectedPageComponentPropsType } from "@/types/ComponentTypes";
import { UserType } from "@/types/UserTypes";
import { getNewReference } from "@/utils/utils";
import { UUID } from "crypto";
import { LogOut, MessagesSquare, Settings, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import MobileSignedInNavbar from "./MobileSignedInNavbar";

const SignedInNavbar = ({
  user,
  setUser,
  usernamesList,
}: ProtectedPageComponentPropsType) => {
  const pathname = usePathname();

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

  function chatWithFromID(id: UUID) {
    return usernamesList.find((usernameWithID) => usernameWithID.id === id);
  }

  async function logout() {
    const res = await fetch("/api/logout");
    const data = await res.json();
    if (data.message === "Success") {
      window.location.reload();
    } else {
      toast.error(
        "An unexpected error occured when trying to log out, please try again."
      );
    }
  }

  return (
    <>
      <nav className={styles.nav}>
        <Link className={styles["logo-container"]} href="/chats">
          <Image
            loading="eager"
            priority
            className={styles.logo}
            src="/favicon.ico"
            height={50}
            width={50}
            alt="Website logo"
          />
        </Link>
        <p className={styles.overview}>Overview</p>
        <div className={styles["overview-tabs"]}>
          <Link
            href="/chats"
            className={
              pathname === "/chats" ? styles["overview-tab-active"] : ""
            }
          >
            <span className={styles["overview-logo"]}>
              <MessagesSquare />
            </span>
            <div className={styles["overview-text"]}>Chats</div>
          </Link>

          <Link
            href="/friends"
            className={
              pathname === "/friends" ? styles["overview-tab-active"] : ""
            }
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
            className={
              pathname === "/settings" ? styles["overview-tab-active"] : ""
            }
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
            .map((chat, index) => (
              <Link
                href={`/chats/${chat.id}`}
                className={styles.chat}
                key={chat.id}
              >
                <Image
                  src={String(chatWithFromID(chat.withID)?.profilePicture)}
                  alt="Profile Picture"
                  height={22.5}
                  width={22.5}
                />
                {chatWithFromID(chat.withID)?.displayName}
                <X
                  onClick={(e) =>
                    hideChat(e as unknown as MouseEvent, chat.id, index)
                  }
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
            <div className={styles["user-details-names"]}>
              <p className={styles["display-name"]}>{user.displayName}</p>
              <p className={styles["user-name"]}>{user.username}</p>
            </div>
          </div>
          <LogOut id={styles.logout} onClick={logout} />
        </div>
      </nav>
      <MobileSignedInNavbar
        user={user}
        hideChat={hideChat}
        styles={styles}
        logout={logout}
        chatWithFromID={chatWithFromID}
      />
    </>
  );
};

export default SignedInNavbar;
