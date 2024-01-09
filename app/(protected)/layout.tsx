import { LayoutPropsType } from "@/types/ComponentTypes";
import "./globals.css";

export default async function RootLayout({ children }: LayoutPropsType) {
  // const token = cookies().get("token")?.value;
  // const res = await fetch(`${process.env.URL}/api/user`, {
  //   cache: "no-store",
  //   headers: {
  //     cookie: `token=${token}`,
  //   },
  // });
  // const data = await res.json();
  // const user: UserType = data.user;

  return (
    <>
      {/* <Test user={user} /> */}
      <main>{children}</main>
    </>
  );
}
