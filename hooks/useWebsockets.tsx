"use client";

import {
  Chat,
  Friend,
  IncomingFriendRequest,
  OutgoingFriendRequest,
  User,
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
          const indexDeleted = user?.outgoingFriendRequests.indexOf(
            user?.outgoingFriendRequests.filter((val) =>
              data.outgoingFriendRequests.every(
                (val2) => !compareObjects(val, val2)
              )
            )[0]
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

          const indexDeleted = user?.outgoingFriendRequests.indexOf(
            user?.outgoingFriendRequests.filter((val: any) =>
              data.outgoingFriendRequests.every(
                (val2) => !compareObjects(val, val2)
              )
            )[0]
          );
          toast.info("Accepted friend request", {
            description: `${
              user?.outgoingFriendRequests[indexDeleted as number].toDisplayName
            } accepted the friend request you sent them`,
          });
          setUser(currentUser);
        },
      },
      {
        event: "new-message",
        receiveFunction: function (data: {
          chatID: UUID;
          message: {
            message: any;
            timestamp: any;
            fromYou: boolean;
          };
        }) {
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
        event: "friend-removed",
        receiveFunction: function (data: {
          newUser: User;
          friendDeletedID: UUID;
        }) {
          setUser(data.newUser);
          toast.info("Deleted friend request", {
            description: `${
              user.friends.find((friend) => friend.id === data.friendDeletedID)
                ?.alias
            } has removed you as a friend`,
          });
        },
      },
    ];
    channel.bindToEvents(binds);
    return () => {
      channel.disconnect();
    };
  }, [user]);
}
