/* eslint-disable no-unused-vars */
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { UUID } from "crypto";
import { create } from "zustand";
import { connectToWebsockets } from "./connectToWebsockets";

export type UserStateType = {
  user: UserType | undefined;
  key: UUID | undefined;
  setUser: (newUser: UserType) => void;
  setKey: (newKey: UUID) => void;
  initWebsockets: (pathname: string, userDetailsList: UserDetailsList) => void;
};

type UserDetailsStoreType = {
  userDetailsList: UserDetailsList | undefined;
  setUserDetailsList: (newUserDetails: UserDetailsList) => void;
};

export const UserStore = create<UserStateType>()((set, getState) => ({
  user: undefined,
  key: undefined,
  setUser: (newUser: UserType) => set({ user: newUser }),
  setKey: (newKey: UUID) => set({ key: newKey }),

  initWebsockets: (pathname: string, userDetailsList: UserDetailsList) => {
    connectToWebsockets(set, getState, userDetailsList, pathname);
  },
}));

export const UserDetailsStore = create<UserDetailsStoreType>()((set) => ({
  userDetailsList: undefined,
  setUserDetailsList: (newUserDetails: UserDetailsList) =>
    set({ userDetailsList: newUserDetails }),
}));

export function getUser() {
  return UserStore((state) => state.user) as UserType;
}

export function getUserKey() {
  return UserStore((state) => state.key) as UUID;
}

export function getUserDetailsList() {
  return UserDetailsStore((state) => state.userDetailsList) as UserDetailsList;
}

export function setUserDetailsList(newUserDetailsList: UserDetailsList) {
  UserDetailsStore((state) => state.setUserDetailsList)(newUserDetailsList);
}
