import FriendRequestsContainer from "@/components/FriendRequestsContainer";
import { UserType } from "@/types/UserTypes";
import { UUID } from "crypto";
import { cookies } from "next/headers";

const Page = async (props: any) => {
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

  return (
    <FriendRequestsContainer
      usernamesWithIDs={data.usernamesWithIDs}
      user={user}
      uuid={key}
    />
  );
};

export default Page;
