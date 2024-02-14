import MainContainer from "@/components/Layouts/MainContainer";
import Navbar from "@/components/Navbar/Navbar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://whispernet.chat"),
  title: "WhisperNet",
  description: "The ability to communicate at the tip of your finger.",
  openGraph: {
    images: "/opengraph-image.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico"></link>
      <SpeedInsights />
      <Analytics />
      <body className={poppins.className}>
        <Navbar />
        <Toaster
          richColors
          expand
          visibleToasts={3}
          closeButton
          position="top-center"
          toastOptions={{ style: { fontSize: "17px" } }}
          theme="dark"
        />
        <MainContainer>{children}</MainContainer>
      </body>
    </html>
  );
}
