"use client";

import { usePathname } from "next/navigation";

const MainContainer = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const navPaths = ["/", "/signup", "/login"];

  if (pathname.includes("/dashboard")) return <>{children}</>;

  return (
    <main style={{ marginTop: navPaths.includes(pathname) ? "110px" : "auto" }}>
      {pathname === "/terms-of-service" || pathname === "/privacy-policy" ? (
        <style jsx global>
          {`
            body {
              padding: 0px;
            }
          `}
        </style>
      ) : null}
      {children}
    </main>
  );
};

export default MainContainer;
