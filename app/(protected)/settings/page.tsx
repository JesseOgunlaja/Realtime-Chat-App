import SettingsContainer from "@/components/Settings/SettingsContainer";
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { decryptString } from "@/utils/encryption";
import { UUID } from "crypto";
import { cookies } from "next/headers";

const Page = async () => {
  const token = cookies().get("token")?.value;
  const res = await fetch(`${process.env.URL}/api/user`, {
    cache: "no-store",
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
    <SettingsContainer
      userDetailsList={userDetailsList}
      user={user}
      userKey={key}
    />
  );
};

export default Page;
