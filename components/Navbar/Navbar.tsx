"use client";

import styles from "@/styles/navbar.module.css";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const [mobileNavbarVisibility, setMobileNavbarVisibility] =
    useState<boolean>(false);
  const pathname = usePathname();
  const signedOutNavPaths = ["/", "/signup", "/login"];

  if (!signedOutNavPaths.includes(pathname)) return <></>;

  return (
    <>
      <style jsx global>{`
        body {
          overflow: ${mobileNavbarVisibility ? "hidden" : "auto"};
        }
      `}</style>
      <nav className={styles.nav}>
        <ul>
          <li className={styles.title}>
            <Link href="/">
              <Image
                src="/favicon.ico"
                alt="Logo"
                priority
                loading="eager"
                width={50}
                height={50}
              />
            </Link>
          </li>
          <li>
            <Link href="/login">Log in</Link>
          </li>
          <li>
            <Link href="/signup">Sign up</Link>
          </li>
          <li
            onClick={() => setMobileNavbarVisibility(!mobileNavbarVisibility)}
          >
            {mobileNavbarVisibility ? <X /> : <Menu />}
          </li>
        </ul>
      </nav>
      <nav
        className={styles["mobile-navbar"]}
        style={{
          opacity: mobileNavbarVisibility ? "1" : "0",
          visibility: mobileNavbarVisibility ? "visible" : "hidden",
        }}
      >
        <ul>
          <li>
            <Link
              onClick={() => setMobileNavbarVisibility(false)}
              href="/signup"
            >
              Sign up
            </Link>
          </li>
          <li>
            <Link
              onClick={() => setMobileNavbarVisibility(false)}
              href="/login"
            >
              Log in
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
