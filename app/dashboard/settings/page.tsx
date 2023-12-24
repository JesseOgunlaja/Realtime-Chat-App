import SettingsContainer from "@/components/SettingsContainer";
import { User } from "@/utils/redis";
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
  const user: User = data.user;
  const key: UUID = data.key;

  return <SettingsContainer user={user} uuid={key} />;
};

export default Page;
