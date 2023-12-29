import { UUID } from "crypto";
import { DispatchUserType, UserType } from "./UserTypes";

export type StylesType = {
  readonly [key: string]: string;
};

export type DashboardPageContainerPropsType = {
  user: UserType;
  uuid: UUID;
  usernamesWithIDs: string;
};

export type DashboardPageComponentPropsType = {
  user: UserType;
  setUser: DispatchUserType;
  usernamesWithIDs: string;
};

export type SettingsPageComponentPropsType = {
  user: UserType;
  setUser: DispatchUserType;
  styles: StylesType;
};

export type LayoutPropsType = {
  children: React.ReactNode;
};
