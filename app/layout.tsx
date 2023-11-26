import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MainContainer from "@/components/MainContainer";
import { Toaster } from "sonner";

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WhisperNet",
  description: "The ability to communicate at the tip of your finger.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Navbar />
        <Toaster
          richColors
          expand
          visibleToasts={3}
          closeButton={true}
          position="top-center"
          toastOptions={{ style: { fontSize: "17px" } }}
          theme="dark"
        />
        <MainContainer>{children}</MainContainer>
      </body>
    </html>
  );
}
