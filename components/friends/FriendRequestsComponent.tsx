import acceptFriendRequestAction from "@/actions/friend/requests/accept";
import cancelMyFriendRequestAction from "@/actions/friend/requests/cancel";
import declineFriendRequestAction from "@/actions/friend/requests/decline";
import styles from "@/styles/friend-requests.module.css";
import { ProtectedPageComponentPropsType } from "@/types/ComponentTypes";
import {
  IncomingFriendRequest,
  OutgoingFriendRequest,
} from "@/types/UserTypes";
import { getDisplayNameFromID, getProfilePictureFromID } from "@/utils/utils";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

const FriendRequestsComponent = ({
  user,
  userKey,
  userDetailsList,
}: ProtectedPageComponentPropsType) => {
  async function declineFriendRequest(
    friendRequestBeingDeclined: IncomingFriendRequest
  ) {
    const loadingToastID = toast.loading("Loading");

    await declineFriendRequestAction(
      userKey,
      user,
      friendRequestBeingDeclined.fromID
    );
    toast.success("Success", {
      id: loadingToastID,
    });
  }

  async function deleteMyFriendRequest(
    friendRequestBeingDeleted: OutgoingFriendRequest
  ) {
    const loadingToastID = toast.loading("Loading");

    await cancelMyFriendRequestAction(
      userKey,
      user,
      friendRequestBeingDeleted.toID
    );

    toast.success("Success", {
      id: loadingToastID,
    });
  }

  async function acceptFriendRequest(
    friendRequestBeingAccepted: IncomingFriendRequest
  ) {
    const loadingToastID = toast.loading("Loading");
    await acceptFriendRequestAction(
      userKey,
      user,
      friendRequestBeingAccepted.fromID
    );
    toast.success("Success", {
      id: loadingToastID,
    });
  }

  return (
    <div className={styles.page}>
      <h1 className={styles["title"]}>Friend requests</h1>
      {user.incomingFriendRequests.length +
        user.outgoingFriendRequests.length ===
        0 && <p className={styles["no-friend-requests"]}>No friend requests</p>}
      <div className={styles["all-requests"]}>
        {user.incomingFriendRequests.map((friendRequest) => (
          <div
            key={friendRequest.fromID}
            className={styles["incoming-friend-request"]}
          >
            <Image
              src={getProfilePictureFromID(
                userDetailsList,
                friendRequest.fromID
              )}
              priority
              loading="eager"
              alt={`${getDisplayNameFromID(
                userDetailsList,
                friendRequest.fromID
              )}'s profile picture`}
              height={35}
              width={35}
            />
            <p>{getDisplayNameFromID(userDetailsList, friendRequest.fromID)}</p>
            <Check onClick={() => acceptFriendRequest(friendRequest)} />
            <X onClick={() => declineFriendRequest(friendRequest)} />
          </div>
        ))}
        {user.outgoingFriendRequests.map((friendRequest) => (
          <div
            key={friendRequest.toID}
            className={styles["outgoing-friend-request"]}
          >
            <Image
              src={getProfilePictureFromID(userDetailsList, friendRequest.toID)}
              priority
              loading="eager"
              alt={`${getDisplayNameFromID(
                userDetailsList,
                friendRequest.toID
              )}'s profile picture`}
              height={35}
              width={35}
            />
            <p>{getDisplayNameFromID(userDetailsList, friendRequest.toID)}</p>
            <X onClick={() => deleteMyFriendRequest(friendRequest)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequestsComponent;
