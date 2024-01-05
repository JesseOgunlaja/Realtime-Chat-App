import styles from "@/styles/friends.module.css";
import { ProtectedPageComponentPropsType } from "@/types/ComponentTypes";
import { Mail, UserPlus2, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AddFriendComponent from "./AddFriendComponent";
import FriendRequestsComponent from "./FriendRequestsComponent";
import FriendsListComponent from "./FriendsListComponent";

type PageParamType = "list" | "add" | "requests";

const FriendsComponent = (props: ProtectedPageComponentPropsType) => {
  const validValues = ["list", "add", "requests"];

  const pageSearchParam = useSearchParams().get("page");

  const page =
    !pageSearchParam || !validValues.includes(pageSearchParam)
      ? "list"
      : (pageSearchParam as PageParamType);

  return (
    <>
      <nav className={styles.nav}>
        <ul>
          <li className={page === "list" ? styles["active-page"] : ""}>
            <Link replace href="?page=list">
              <p>All</p>
              <Users />
            </Link>
          </li>
          <li className={page === "requests" ? styles["active-page"] : ""}>
            <Link replace href="?page=requests">
              <p>Requests</p>
              <Mail />
            </Link>
          </li>
          <li className={page === "add" ? styles["active-page"] : ""}>
            <Link replace href="?page=add">
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
