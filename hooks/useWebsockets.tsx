"use client";

import { decryptString } from "@/utils/encryption";
import {
  Chat,
  Friend,
  IncomingFriendRequest,
  Message,
  OutgoingFriendRequest,
  User,
} from "@/utils/redis";
import { getNewReference } from "@/utils/utils";
import { websocketChannel } from "@/utils/websockets";
import { UUID } from "crypto";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, useEffect } from "react";
import { toast } from "sonner";

export function useWebsockets(
  uuid: UUID,
  user: User,
  setUser: Dispatch<User>,
  usernamesWithIDs: string
) {
  const pathname = usePathname();

  const decryptedUsernamesWithIDs = JSON.parse(
    decryptString(usernamesWithIDs, true)
  ) as {
    name: string;
    displayName: string;
    id: UUID;
  }[];

  useEffect(() => {
    const channel = websocketChannel(uuid);
    const binds = [
      {
        event: "friend-request-declined",
        receiveFunction: function (data: {
          outgoingFriendRequests: OutgoingFriendRequest[];
        }) {
          const currentUser = getNewReference(user) as User;
          currentUser.outgoingFriendRequests = data.outgoingFriendRequests;
          const indexDeleted = user?.outgoingFriendRequests.findIndex(
            (request) => {
              return (
                request.toID ===
                user?.outgoingFriendRequests.filter(
                  (val) =>
                    data.outgoingFriendRequests.findIndex(
                      (val2) => val.toID === val2.toID
                    ) === -1
                )[0].toID
              );
            }
          );
          toast.info("Friend request declined", {
            description: `${
              decryptedUsernamesWithIDs.find(
                (decryptedUsernameWithID) =>
                  decryptedUsernameWithID.id ===
                  user?.outgoingFriendRequests[indexDeleted as number].toID
              )?.displayName
            } has declined your friend request`,
          });
          setUser(currentUser);
        },
      },
      {
        event: "friend-request-sent",
        receiveFunction: function (data: {
          newFriendRequest: IncomingFriendRequest;
        }) {
          const currentUser = getNewReference(user) as User;
          currentUser.incomingFriendRequests.push(data.newFriendRequest);
          setUser(currentUser);
          toast.info("New friend request", {
            description: `${
              decryptedUsernamesWithIDs.find(
                (decryptedUsernameWithID) =>
                  decryptedUsernameWithID.id === data.newFriendRequest.fromID
              )?.displayName
            } has sent you a friend request`,
          });
        },
      },
      {
        event: "friend-request-deleted",
        receiveFunction: function (data: {
          incomingFriendRequests: IncomingFriendRequest[];
        }) {
          const currentUser = getNewReference(user) as User;
          currentUser.incomingFriendRequests = data.incomingFriendRequests;
          const indexDeleted = user?.incomingFriendRequests.findIndex(
            (request) => {
              return (
                request.fromID ===
                user?.incomingFriendRequests.filter(
                  (val) =>
                    data.incomingFriendRequests.findIndex(
                      (val2) => val.fromID === val2.fromID
                    ) === -1
                )[0].fromID
              );
            }
          );
          toast.info("Friend request declined", {
            description: `${
              decryptedUsernamesWithIDs.find(
                (decryptedUsernameWithID) =>
                  decryptedUsernameWithID.id ===
                  user?.incomingFriendRequests[indexDeleted as number].fromID
              )?.displayName
            } has cancelled the friend request they sent you`,
          });
          setUser(currentUser);
        },
      },
      {
        event: "friend-request-accepted",
        receiveFunction: function (data: {
          outgoingFriendRequests: OutgoingFriendRequest[];
          friends: Friend[];
          chats: Chat[];
        }) {
          const currentUser = getNewReference(user) as User;
          currentUser.outgoingFriendRequests = data.outgoingFriendRequests;
          currentUser.friends = data.friends;
          currentUser.chats = data.chats;

          const newIndex = data?.friends.findIndex((friend) => {
            return (
              friend.id ===
              data?.friends.filter(
                (val) =>
                  user.friends.findIndex((val2) => val.id === val2.id) === -1
              )[0].id
            );
          });

          toast.info("Accepted friend request", {
            description: `${
              decryptedUsernamesWithIDs.find(
                (decryptedUsernameWithID) =>
                  decryptedUsernameWithID.id ===
                  data.friends[newIndex as number].id
              )?.displayName
            } accepted the friend request you sent them`,
          });
          setUser(currentUser);
        },
      },
      {
        event: "new-message",
        receiveFunction: function (data: { chatID: UUID; message: Message }) {
          const chatIndex = user.chats.findIndex(
            (chat) => chat.id === data.chatID
          );
          if (!pathname.includes(data.chatID)) {
            toast(
              <Link
                prefetch={false}
                style={{ width: "100%", color: "white" }}
                href={`/dashboard/chats/${data.chatID}`}
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
                  {
                    decryptedUsernamesWithIDs.find(
                      (decryptedUsernameWithID) =>
                        decryptedUsernameWithID.id ===
                        user.chats[chatIndex].withID
                    )?.displayName
                  }
                </p>
                <p>{data.message.message}</p>
              </Link>,
              {
                duration: 3500,
              }
            );
          }
          const currentUser = getNewReference(user) as User;
          currentUser.chats[chatIndex].visible = true;
          currentUser.chats[chatIndex].messages.push(data.message);
          setUser(currentUser);
        },
      },
      {
        event: "new-message-sent",
        receiveFunction: function (data: { chatID: UUID; message: Message }) {
          const chatIndex = user.chats.findIndex(
            (chat) => chat.id === data.chatID
          );
          if (
            user.chats[chatIndex].messages.findIndex(
              (message) => message.id === data.message.id || message.id === null
            ) === -1
          ) {
            const currentUser = getNewReference(user) as User;
            currentUser.chats[chatIndex].visible = true;
            currentUser.chats[chatIndex].messages.push(data.message);
            setUser(currentUser);
          }
        },
      },
      {
        event: "friend-removed",
        receiveFunction: function (data: {
          newUser: User;
          friendDeletedID: UUID;
        }) {
          setUser(data.newUser);
          toast.info("Removed friend", {
            description: `${
              decryptedUsernamesWithIDs.find(
                (decryptedUsernameWithID) =>
                  decryptedUsernameWithID.id === data.friendDeletedID
              )?.displayName
            } has removed you as a friend`,
          });
        },
      },
      {
        event: "message-edited",
        receiveFunction: function (data: { chats: Chat[] }) {
          const currentUser = getNewReference(user);
          currentUser.chats = data.chats;
          setUser(currentUser);
        },
      },
      {
        event: "message-edited-sent",
        receiveFunction: function (data: { chats: Chat[]; chatID: UUID }) {
          if (
            JSON.stringify(
              user.chats.find((chat) => chat.id === data.chatID)?.messages
            ) !==
            JSON.stringify(
              data.chats.find((chat) => chat.id === data.chatID)?.messages
            )
          ) {
            const currentUser = getNewReference(user);
            currentUser.chats = data.chats;
            setUser(currentUser);
          }
        },
      },
      {
        event: "deleted-message",
        receiveFunction: function (data: { chatID: UUID; messageID: UUID }) {
          const currentUser = getNewReference(user) as User;
          const chatIndex = user.chats.findIndex(
            (chat) => chat.id === data.chatID
          );
          currentUser.chats[chatIndex].messages.splice(
            user.chats[chatIndex].messages.findIndex(
              (message) => message.id === data.messageID
            ),
            1
          );
          setUser(currentUser);
        },
      },
      {
        event: "message-deleted",
        receiveFunction: function (data: {
          newUser: User;
          chatID: UUID;
          messageID: UUID;
        }) {
          const currentUser = getNewReference(user) as User;
          const chatIndex = user.chats.findIndex(
            (chat) => chat.id === data.chatID
          );
          const messageIndex = user.chats[chatIndex].messages.findIndex(
            (message) => message.id === data.messageID
          );
          if (messageIndex !== -1) {
            currentUser.chats[chatIndex].messages.splice(messageIndex, 1);
            setUser(currentUser);
          }
        },
      },
    ];
    channel.bindToEvents(binds);
    return () => {
      channel.disconnect();
    };
  }, [user]);
}
