import styles from "@/styles/friends.module.css";
import { ProtectedPageComponentPropsType } from "@/types/ComponentTypes";
import { Mail, UserPlus2, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import AddFriendComponent from "./AddFriendComponent";
import FriendRequestsComponent from "./FriendRequestsComponent";
import FriendsListComponent from "./FriendsListComponent";

type PageParamType = "list" | "add" | "requests";

const FriendsComponent = (props: ProtectedPageComponentPropsType) => {
  const router = useRouter();
  const validValues = ["list", "add", "requests"];

  const pageSearchParam = useSearchParams().get("page");

  const [page, setPage] = useState<PageParamType>(
    pageSearchParam && validValues.includes(pageSearchParam)
      ? (pageSearchParam as PageParamType)
      : "list"
  );

  return (
    <>
      <nav className={styles.nav}>
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
              {props.user.incomingFriendRequests.length !== 0 && (
                <span>{props.user.incomingFriendRequests.length}</span>
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
        {page === "add" && <AddFriendComponent {...props} />}
        {page === "list" && <FriendsListComponent {...props} />}
        {page === "requests" && <FriendRequestsComponent {...props} />}
      </div>
    </>
  );
};

export default FriendsComponent;
