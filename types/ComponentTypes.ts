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
  usernamesList: UserDetailsList;
};

export type ProtectedPageComponentPropsType = {
  user: UserType;
  userKey: UUID;
  setUser: DispatchUserType;
  setUsernamesList: DispatchUsernamesList;
  usernamesList: UserDetailsList;
};

export type SettingsPageComponentPropsType = {
  user: UserType;
  userKey: UUID;
  setUser: DispatchUserType;
  setUsernamesList: DispatchUsernamesList;
  styles: StylesType;
  usernamesList: UserDetailsList;
};

export type LayoutPropsType = {
  children: React.ReactNode;
};
