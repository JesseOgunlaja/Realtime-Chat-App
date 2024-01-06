import styles from "@/styles/friends.module.css";
import { ProtectedPageComponentPropsType } from "@/types/ComponentTypes";
import { Mail, UserPlus2, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import AddFriendComponent from "./AddFriendComponent";
import FriendRequestsComponent from "./FriendRequestsComponent";
import FriendsListComponent from "./FriendsListComponent";

type PageParamType = "list" | "add" | "requests";

const FriendsComponent = (props: ProtectedPageComponentPropsType) => {
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
          <li className={page === "list" ? styles["active-page"] : ""}>
            <Link onClick={() => setPage("list")} replace href="?page=list">
              <p>All</p>
              <Users />
            </Link>
          </li>
          <li
            onClick={() => setPage("requests")}
            className={page === "requests" ? styles["active-page"] : ""}
          >
            <Link replace href="?page=requests">
              <p>
                Requests
                {props.user.incomingFriendRequests.length !== 0 && (
                  <span>{props.user.incomingFriendRequests.length}</span>
                )}
              </p>
              <Mail />
            </Link>
          </li>
          <li className={page === "add" ? styles["active-page"] : ""}>
            <Link onClick={() => setPage("add")} replace href="?page=add">
              <p>Add friend</p>
              <UserPlus2 />
            </Link>
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
