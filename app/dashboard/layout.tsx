import { LayoutPropsType } from "@/types/ComponentTypes";
import "./globals.css";

export default async function RootLayout({ children }: LayoutPropsType) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
