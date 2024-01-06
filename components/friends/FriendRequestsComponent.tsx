import styles from "@/styles/friend-requests.module.css";
import { ProtectedPageComponentPropsType } from "@/types/ComponentTypes";
import {
  IncomingFriendRequest,
  OutgoingFriendRequest,
  UserType,
} from "@/types/UserTypes";
import {
  getDisplayNameFromID,
  getNewReference,
  getProfilePictureFromID,
} from "@/utils/utils";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

const FriendRequestsComponent = ({
  user,
  setUser,
  userDetailsList,
}: ProtectedPageComponentPropsType) => {
  async function declineFriendRequest(
    friendRequestBeingDeclined: IncomingFriendRequest,
    index: number
  ) {
    const currentUser = getNewReference(user) as UserType;
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
    const currentUser = getNewReference(user) as UserType;
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
    const currentUser = getNewReference(user) as UserType;
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
      {user.incomingFriendRequests.length +
        user.outgoingFriendRequests.length ===
        0 && <p className={styles["no-friend-requests"]}>No friend requests</p>}
      <div className={styles["all-requests"]}>
        {user.incomingFriendRequests.map((friendRequest, index: number) => (
          <div
            key={friendRequest.fromID}
            className={styles["incoming-friend-request"]}
          >
            <Image
              src={getProfilePictureFromID(
                userDetailsList,
                friendRequest.fromID
              )}
              alt={`${getDisplayNameFromID(
                userDetailsList,
                friendRequest.fromID
              )}'s profile picture`}
              height={35}
              width={35}
            />
            <p>{getDisplayNameFromID(userDetailsList, friendRequest.fromID)}</p>
            <Check onClick={() => acceptFriendRequest(friendRequest, index)} />
            <X onClick={() => declineFriendRequest(friendRequest, index)} />
          </div>
        ))}
        {user.outgoingFriendRequests.map((friendRequest, index: number) => (
          <div
            key={friendRequest.toID}
            className={styles["outgoing-friend-request"]}
          >
            <p>{getDisplayNameFromID(userDetailsList, friendRequest.toID)}</p>
            <X onClick={() => deleteMyFriendRequest(friendRequest, index)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequestsComponent;
