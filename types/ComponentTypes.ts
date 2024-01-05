import { UUID } from "crypto";
import {
  DispatchUserType,
  DispatchUsernamesList,
  UserDetailsList,
  UserType,
} from "./UserTypes";

export type StylesType = {
  readonly [key: string]: string;
};

export type ProtectedPageContainerPropsType = {
  user: UserType;
  userKey: UUID;
  userDetailsList: UserDetailsList;
};

export type ProtectedPageComponentPropsType = {
  user: UserType;
  userKey: UUID;
  setUser: DispatchUserType;
  setUserDetailsList: DispatchUsernamesList;
  userDetailsList: UserDetailsList;
};

export type SettingsPageComponentPropsType = {
  user: UserType;
  userKey: UUID;
  setUser: DispatchUserType;
  setUserDetailsList: DispatchUsernamesList;
  styles: StylesType;
  userDetailsList: UserDetailsList;
};

export type LayoutPropsType = {
  children: React.ReactNode;
};
