"use client";

import { UserStore } from "@/utils/zustand";
import { ReactNode } from "react";
import { useStore } from "zustand";

const ProtectedPageLayout = ({ children }: { children: ReactNode }) => {
  const user = useStore(UserStore, (state) => state.user);

  if (!user) return;

  return <main>{children}</main>;
};

export default ProtectedPageLayout;
