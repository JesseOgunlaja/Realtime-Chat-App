"use client";

import {
  Chat,
  Friend,
  IncomingFriendRequest,
  OutgoingFriendRequest,
  User,
  message,
} from "@/utils/redis";
import { compareObjects } from "@/utils/utils";
import { websocketChannel } from "@/utils/websockets";
import { UUID } from "crypto";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, useEffect } from "react";
import { toast } from "sonner";

export function useWebsockets(uuid: UUID, user: User, setUser: Dispatch<User>) {
  const pathname = usePathname();

  useEffect(() => {
    const channel = websocketChannel(uuid);
    const binds = [
      {
        event: "friend-request-declined",
        receiveFunction: function (data: {
          outgoingFriendRequests: OutgoingFriendRequest[];
        }) {
          const currentUser = JSON.parse(JSON.stringify(user)) as User;
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
              user?.outgoingFriendRequests[indexDeleted as number].toDisplayName
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
          const currentUser = JSON.parse(JSON.stringify(user)) as User;
          currentUser.incomingFriendRequests.push(data.newFriendRequest);
          setUser(currentUser);
          toast.info("New friend request", {
            description: `${data.newFriendRequest.from[0].concat(
              data.newFriendRequest.from.substring(1).toLowerCase()
            )} has sent you a friend request`,
          });
        },
      },
      {
        event: "friend-request-deleted",
        receiveFunction: function (data: {
          incomingFriendRequests: IncomingFriendRequest[];
        }) {
          const currentUser = JSON.parse(JSON.stringify(user)) as User;
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
          console.log(indexDeleted);
          toast.info("Friend request declined", {
            description: `${
              user?.incomingFriendRequests[indexDeleted as number]
                .fromDisplayName
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
          const currentUser = JSON.parse(JSON.stringify(user)) as User;
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

          console.log(newIndex);

          toast.info("Accepted friend request", {
            description: `${
              data.friends[newIndex as number].alias
            } accepted the friend request you sent them`,
          });
          setUser(currentUser);
        },
      },
      {
        event: "new-message",
        receiveFunction: function (data: { chatID: UUID; message: message }) {
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
                  {user.chats[chatIndex].with}
                </p>
                <p>{JSON.parse(data.message.message)}</p>
              </Link>,
              {
                duration: 3500,
              }
            );
          }
          const currentUser = JSON.parse(JSON.stringify(user)) as User;
          currentUser.chats[chatIndex].visible = true;
          currentUser.chats[chatIndex].messages.push(data.message);
          setUser(currentUser);
        },
      },
      {
        event: "new-message-sent",
        receiveFunction: function (data: { chatID: UUID; message: message }) {
          const chatIndex = user.chats.findIndex(
            (chat) => chat.id === data.chatID
          );
          if (
            compareObjects(
              user.chats[chatIndex].messages.at(-1) as message,
              data.message
            ) === false &&
            user.chats[chatIndex].messages.at(-1)?.uuid != null
          ) {
            const currentUser = JSON.parse(JSON.stringify(user)) as User;
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
              user.friends.find((friend) => friend.id === data.friendDeletedID)
                ?.alias
            } has removed you as a friend`,
          });
        },
      },
      {
        event: "message-edited",
        receiveFunction: function (data: { chats: Chat[] }) {
          const currentUser = JSON.parse(JSON.stringify(user));
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
            const currentUser = JSON.parse(JSON.stringify(user));
            currentUser.chats = data.chats;
            setUser(currentUser);
          }
        },
      },
    ];
    channel.bindToEvents(binds);
    return () => {
      console.log("hi");
      channel.disconnect();
    };
  }, [user]);
}
