"use client";

import AddFriendComponent from "@/components/friends/AddFriendComponent";
import FriendRequestsComponent from "@/components/friends/FriendRequestsComponent";
import FriendsListComponent from "@/components/friends/FriendsListComponent";
import styles from "@/styles/friends.module.css";
import { isSafari } from "@/utils/utils";
import { getUser } from "@/utils/zustand";
import { Mail, UserPlus2, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type PageParamType = "list" | "add" | "requests";

const Page = () => {
  const router = useRouter();
  const validValues = ["list", "add", "requests"];
  const is_safari = isSafari();

  const pageSearchParam = useSearchParams().get("page");

  const [page, setPage] = useState<PageParamType>(
    pageSearchParam && validValues.includes(pageSearchParam)
      ? (pageSearchParam as PageParamType)
      : "list"
  );

  const user = getUser();

  return (
    <>
      <nav
        style={{ transform: is_safari ? "translate(-10px, -70px)" : "" }}
        className={styles.nav}
      >
        <ul>
          <li
            onClick={() => {
              router.replace("/friends?page=list");
              setPage("list");
            }}
            className={page === "list" ? styles["active-page"] : ""}
          >
            <p>All</p>
            <Users />
          </li>
          <li
            onClick={() => {
              router.replace("/friends?page=requests");
              setPage("requests");
            }}
            className={page === "requests" ? styles["active-page"] : ""}
          >
            <p>
              Requests
              {user.incomingFriendRequests.length !== 0 && (
                <span>{user.incomingFriendRequests.length}</span>
              )}
            </p>
            <Mail />
          </li>
          <li
            onClick={() => {
              router.replace("/friends?page=add");
              setPage("add");
            }}
            className={page === "add" ? styles["active-page"] : ""}
          >
            <p>Add friend</p>
            <UserPlus2 />
          </li>
        </ul>
      </nav>
      <div className={styles.page}>
        {page === "add" && <AddFriendComponent />}
        {page === "list" && <FriendsListComponent />}
        {page === "requests" && <FriendRequestsComponent />}
      </div>
    </>
  );
};

export default Page;
