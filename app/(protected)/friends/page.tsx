import FriendsContainer from "@/components/friends/FriendsContainer";
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { decryptString } from "@/utils/encryption";
import { UUID } from "crypto";
import { cookies } from "next/headers";

const Page = async () => {
  const token = cookies().get("token")?.value;
  const res = await fetch(`${process.env.URL}/api/user`, {
    next: {
      revalidate: 0,
    },
    headers: {
      cookie: `token=${token}`,
    },
  });
  const data = await res.json();
  const user: UserType = data.user;
  const key: UUID = data.key;

  const userDetailsList = JSON.parse(
    decryptString(data.userDetailsList, false)
  ) as UserDetailsList;

  return (
    <FriendsContainer
      user={user}
      userKey={key}
      userDetailsList={userDetailsList}
    />
  );
};

export default Page;
