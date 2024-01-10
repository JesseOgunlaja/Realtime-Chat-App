import SignedInNavbar from "@/components/Navbar/SignedInNavbar";
import { UserDetailsList, UserType } from "@/types/UserTypes";
import { UUID } from "crypto";
import { headers } from "next/headers";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const user: UserType = JSON.parse(
    headersList.get("user") as string
  ) as UserType;
  const key = JSON.parse(headersList.get("key") as string) as UUID;

  const userDetailsList = JSON.parse(
    headersList.get("UserDetails") as string
  ) as UserDetailsList;

  return (
    <>
      <SignedInNavbar
        user={user}
        userDetailsList={userDetailsList}
        userKey={key}
      />
      <main>{children}</main>
    </>
  );
}
