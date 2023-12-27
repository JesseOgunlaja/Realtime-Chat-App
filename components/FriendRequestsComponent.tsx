"use client";

import styles from "@/styles/friend-requests.module.css";
import { decryptString } from "@/utils/encryption";
import {
  IncomingFriendRequest,
  OutgoingFriendRequest,
  User,
} from "@/utils/redis";
import { getNewReference } from "@/utils/utils";
import { UUID } from "crypto";
import { Check, X } from "lucide-react";
import { Dispatch } from "react";
import { toast } from "sonner";

const FriendRequestsComponent = ({
  user,
  setUser,
  usernamesWithIDs,
}: {
  user: User;
  setUser: Dispatch<User>;
  usernamesWithIDs: string;
}) => {
  async function declineFriendRequest(
    friendRequestBeingDeclined: IncomingFriendRequest,
    index: number
  ) {
    const currentUser = getNewReference(user) as User;
    currentUser.incomingFriendRequests.splice(index, 1);
    setUser(currentUser);
    const loadingToastID = toast.loading("Loading", { duration: Infinity });
    const res = await fetch("/api/friends/requests/deny", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friendRequestBeingDeclined }),
    });
    const data = await res.json();
    if (data.message !== "Success") {
      setUser(user);
      toast.error("An unexpected error occurred, please try again", {
        id: loadingToastID,
      });
    } else {
      toast.success("Success", {
        id: loadingToastID,
      });
    }
    setTimeout(() => {
      toast.dismiss(loadingToastID);
    }, 1000);
  }

  async function deleteMyFriendRequest(
    friendRequestBeingDeleted: OutgoingFriendRequest,
    index: number
  ) {
    const currentUser = getNewReference(user) as User;
    currentUser.outgoingFriendRequests.splice(index, 1);
    setUser(currentUser);
    const loadingToastID = toast.loading("Loading", { duration: Infinity });
    const res = await fetch("/api/friends/requests/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        friendRequestBeingDeleted: friendRequestBeingDeleted,
      }),
    });
    const data = await res.json();
    if (data.message !== "Success") {
      setUser(user);
      toast.error("An unexpected error occurred, please try again", {
        id: loadingToastID,
      });
    } else {
      toast.success("Success", {
        id: loadingToastID,
      });
    }
    setTimeout(() => {
      toast.dismiss(loadingToastID);
    }, 1000);
  }

  async function acceptFriendRequest(
    friendRequestBeingAccepted: IncomingFriendRequest,
    index: number
  ) {
    const currentUser = getNewReference(user) as User;
    currentUser.incomingFriendRequests.splice(index, 1);
    setUser(currentUser);
    const loadingToastID = toast.loading("Loading", { duration: Infinity });
    const res = await fetch("/api/friends/requests/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friendRequestBeingAccepted }),
    });
    const data = await res.json();
    if (data.message !== "Success") {
      setUser(user);
      toast.error("An unexpected error occurred, please try again", {
        id: loadingToastID,
      });
    } else {
      setUser(data.user);
      toast.success("Success", {
        id: loadingToastID,
      });
    }
    setTimeout(() => {
      toast.dismiss(loadingToastID);
    }, 1000);
  }

  return (
    <div className={styles.page}>
      <h1 className={styles["title"]}>Friend requests</h1>
      {user &&
        user?.incomingFriendRequests.length +
          user?.outgoingFriendRequests.length ===
          0 && (
          <p className={styles["no-friend-requests"]}>No friend requests</p>
        )}
      <div className={styles["all-requests"]}>
        {user?.incomingFriendRequests.map((friendRequest, index: number) => (
          <div
            key={friendRequest.fromID}
            className={styles["incoming-friend-request"]}
          >
            <p>
              {
                (
                  JSON.parse(decryptString(usernamesWithIDs, true)) as {
                    name: string;
                    displayName: string;
                    id: UUID;
                  }[]
                ).find(
                  (usernameWithID) => usernameWithID.id === friendRequest.fromID
                )?.displayName
              }
            </p>
            <Check onClick={() => acceptFriendRequest(friendRequest, index)} />
            <X onClick={() => declineFriendRequest(friendRequest, index)} />
          </div>
        ))}
        {user?.outgoingFriendRequests.map((friendRequest, index: number) => (
          <div
            key={friendRequest.toID}
            className={styles["outgoing-friend-request"]}
          >
            <p>
              {
                (
                  JSON.parse(decryptString(usernamesWithIDs, true)) as {
                    name: string;
                    displayName: string;
                    id: UUID;
                  }[]
                ).find(
                  (usernameWithID) => usernameWithID.id === friendRequest.toID
                )?.displayName
              }
            </p>
            <X onClick={() => deleteMyFriendRequest(friendRequest, index)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequestsComponent;
