import {
  Chat,
  IncomingFriendRequest,
  Message,
  OutgoingFriendRequest,
  UserDetailsList,
  UserType,
} from "@/types/UserTypes";
import { UUID } from "crypto";
import Link from "next/link";
import { toast } from "sonner";
import { getDisplayNameFromID, getNewReference } from "./utils";
import { websocketChannel } from "./websockets";
import { UserStateType } from "./zustand";

export function connectToWebsockets(
  // eslint-disable-next-line no-unused-vars
  set: (newValues: Partial<UserStateType>) => void,
  getState: () => UserStateType,
  userDetailsList: UserDetailsList,
  pathname: string
) {
  const userKey = getState().key as UUID;
  const channel = websocketChannel(userKey);
  const binds = [
    {
      event: "friend-request-canceled",
      receiveFunction: function (
        data: (
          | (IncomingFriendRequest & { type: "incoming" })
          | (OutgoingFriendRequest & { type: "outgoing" })
        ) & { sendToast: boolean }
      ) {
        const user = getState().user as UserType;
        const currentUser = getNewReference(user) as UserType;
        if (data.type === "outgoing") {
          const friendRequestBeingDeclinedIndex =
            user.outgoingFriendRequests.findIndex(
              (friendRequest) => friendRequest.toID === data.toID
            );
          currentUser.outgoingFriendRequests.splice(
            friendRequestBeingDeclinedIndex,
            1
          );
          if (data.sendToast) {
            toast.info("Friend request declined", {
              description: `${getDisplayNameFromID(
                userDetailsList,
                user.outgoingFriendRequests[friendRequestBeingDeclinedIndex]
                  .toID
              )} declined your friend request`,
            });
          }
          const setUser = (newUser: UserType) => set({ user: newUser });
          setUser(currentUser);
        } else {
          const friendRequestBeingDeclinedIndex =
            user.incomingFriendRequests.findIndex(
              (friendRequest) => friendRequest.fromID === data.fromID
            );
          currentUser.incomingFriendRequests.splice(
            friendRequestBeingDeclinedIndex,
            1
          );
          if (data.sendToast) {
            toast.info("Friend request deleted", {
              description: `${getDisplayNameFromID(
                userDetailsList,
                user.incomingFriendRequests[friendRequestBeingDeclinedIndex]
                  .fromID
              )} cancelled the friend request they sent you`,
            });
          }
          const setUser = (newUser: UserType) => set({ user: newUser });
          setUser(currentUser);
        }
      },
    },
    {
      event: "friend-request-sent",
      receiveFunction: function (data: {
        newIncomingFriendRequest?: IncomingFriendRequest;
        newOutgoingFriendRequest?: OutgoingFriendRequest;
      }) {
        const user = getState().user as UserType;
        const currentUser = getNewReference(user) as UserType;
        if (data.newIncomingFriendRequest) {
          currentUser.incomingFriendRequests.push(
            data.newIncomingFriendRequest
          );
          toast.info("New friend request", {
            description: `${getDisplayNameFromID(
              userDetailsList,
              data.newIncomingFriendRequest.fromID
            )} sent you a friend request`,
          });
        } else {
          currentUser.outgoingFriendRequests.push(
            data.newOutgoingFriendRequest!
          );
        }
        const setUser = (newUser: UserType) => set({ user: newUser });
        setUser(currentUser);
      },
    },
    {
      event: "friend-request-accepted",
      receiveFunction: function (data: {
        friendRequestID: UUID;
        sendToast?: boolean;
        newChat: Chat;
      }) {
        const user = getState().user as UserType;
        const currentUser = getNewReference(user) as UserType;
        if (data.sendToast) {
          currentUser.outgoingFriendRequests =
            user.outgoingFriendRequests.filter(
              (friendRequest) => friendRequest.toID !== data.friendRequestID
            );
        } else {
          currentUser.incomingFriendRequests =
            user.incomingFriendRequests.filter(
              (friendRequest) => friendRequest.fromID !== data.friendRequestID
            );
        }
        currentUser.friends.push({
          id: data.friendRequestID,
        });
        currentUser.chats.push(data.newChat);

        if (data.sendToast) {
          toast.info("Accepted friend request", {
            description: `${getDisplayNameFromID(
              userDetailsList,
              data.friendRequestID
            )} accepted the friend request you sent them`,
          });
        }
        const setUser = (newUser: UserType) => set({ user: newUser });
        setUser(currentUser);
      },
    },
    {
      event: "message-sent",
      receiveFunction: function (data: { chatID: UUID; message: Message }) {
        const user = getState().user as UserType;
        const chatIndex = user.chats.findIndex(
          (chat) => chat.id === data.chatID
        );
        if (!pathname.includes(data.chatID) && !data.message.fromYou) {
          toast(
            <Link
              prefetch={false}
              style={{ width: "100%", color: "white" }}
              href={`/chats/${data.chatID}`}
              ref={(node) => {
                if (node) {
                  node.style.setProperty(
                    "text-decoration",
                    "none",
                    "important"
                  );
                }
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                {getDisplayNameFromID(
                  userDetailsList,
                  user.chats[chatIndex].withID
                )}
              </p>
              <p>{data.message.message}</p>
            </Link>,
            {
              duration: 3500,
            }
          );
        }
        const currentUser = getNewReference(user) as UserType;
        currentUser.chats[chatIndex].visible = true;
        currentUser.chats[chatIndex].messages.push(data.message);
        const setUser = (newUser: UserType) => set({ user: newUser });
        setUser(currentUser);
      },
    },
    {
      event: "friend-removed",
      receiveFunction: function (data: { friendID: UUID; sendToast: boolean }) {
        const user = getState().user as UserType;
        const currentUser = getNewReference(user);
        currentUser.friends = currentUser.friends.filter(
          (friend) => friend.id !== data.friendID
        );
        currentUser.chats = currentUser.chats.filter(
          (chat) => chat.withID !== data.friendID
        );
        const setUser = (newUser: UserType) => set({ user: newUser });
        setUser(currentUser);
        if (data.sendToast) {
          toast.info("Removed friend", {
            description: `${getDisplayNameFromID(
              userDetailsList,
              data.friendID
            )} removed you as a friend`,
          });
        }
      },
    },
    {
      event: "message-edited",
      receiveFunction: function (data: {
        messageID: UUID;
        chatID: UUID;
        newMessageText: string;
      }) {
        const user = getState().user as UserType;
        const currentUser = getNewReference(user);
        const chatIndex = user.chats.findIndex(
          (chat) => chat.id === data.chatID
        );
        currentUser.chats[chatIndex].visible = true;
        currentUser.chats[chatIndex].messages.find(
          (message) => message.id === data.messageID
        )!.message = data.newMessageText;
        const setUser = (newUser: UserType) => set({ user: newUser });
        setUser(currentUser);
      },
    },
    {
      event: "message-deleted",
      receiveFunction: function (data: {
        newUser: UserType;
        chatID: UUID;
        messageID: UUID;
      }) {
        const user = getState().user as UserType;
        const currentUser = getNewReference(user) as UserType;
        const chatIndex = user.chats.findIndex(
          (chat) => chat.id === data.chatID
        );
        const messageIndex = user.chats[chatIndex].messages.findIndex(
          (message) => message.id === data.messageID
        );
        currentUser.chats[chatIndex].visible = true;
        if (messageIndex !== -1) {
          currentUser.chats[chatIndex].messages.splice(messageIndex, 1);
          const setUser = (newUser: UserType) => set({ user: newUser });
          setUser(currentUser);
        }
      },
    },
  ];
  channel.bindToEvents(binds);
  return () => {
    channel.disconnect();
  };
}
