/* eslint-disable no-unused-vars */
import { UUID } from "crypto";

export type DispatchUserType = (newUser: UserType) => void;
export type SetUserDetailsList = (newUserDetailsList: UserDetailsList) => void;

export type Message = {
  message: string;
  fromYou: boolean;
  timestamp: number;
  id: UUID;
  replyID?: UUID;
};

export type Chat = {
  id: UUID;
  messages: Message[];
  withID: UUID;
  visible: boolean;
};

export type IncomingFriendRequest = {
  fromID: UUID;
};

export type OutgoingFriendRequest = {
  toID: UUID;
};

export type Friend = {
  id: UUID;
};

export type UserType = {
  profilePicture: string;
  username: string;
  displayName: string;
  password: string;
  incomingFriendRequests: IncomingFriendRequest[];
  outgoingFriendRequests: OutgoingFriendRequest[];
  friends: Friend[];
  chats: Chat[];
  uuid: UUID;
};

export type UserDetailsList = {
  name: string;
  displayName: string;
  profilePicture: string;
  id: UUID;
}[];
