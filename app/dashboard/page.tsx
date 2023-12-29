import DashboardContainer from "@/components/DashboardContainer";
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
    <DashboardContainer
      usernamesWithIDs={data.usernamesWithIDs}
      uuid={key}
      user={user}
    />
  );
};

export default Page;
