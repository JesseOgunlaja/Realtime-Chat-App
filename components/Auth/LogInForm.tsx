"use client";

import styles from "@/styles/signup.module.css";
import { encryptString } from "@/utils/encryption";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Balancer from "react-wrap-balancer";
import { toast } from "sonner";

const SignUpForm = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  function checkValues() {
    const results: boolean[] = [];
    results.push(username !== "");
    if (username == "") toast.error("Username required");
    results.push(password !== "");
    if (password == "") toast.error("Password required");

    return results.every((val) => val === true);
  }

  async function addUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (checkValues()) {
      const loadingToastID = toast.loading("Loading", { duration: Infinity });
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: encryptString(username, true),
          password: encryptString(password, true),
          encrypted: true,
        }),
      });
      const data = await res.json();
      if (data.message === "Success") {
        toast.success("Valid credentials", {
          id: loadingToastID,
        });
        setTimeout(() => {
          toast.dismiss(loadingToastID);
          router.push("/chats");
        }, 1000);
      }
      if (data.message === "Error") {
        if (data.error === "User not found") {
          toast.error("No user was found with that username", {
            id: loadingToastID,
          });
        } else if (data.error === "Invalid credentials") {
          toast.error("Invalid credentials", {
            id: loadingToastID,
          });
        } else {
          toast.error("An error occured, please try again.", {
            id: loadingToastID,
          });
        }
        setTimeout(() => {
          toast.dismiss(loadingToastID);
        }, 2000);
      }
    }
  }

  return (
    <form onSubmit={addUser} className={styles.form}>
      <label htmlFor="username">Username</label>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        type="text"
        name="username"
        id="username"
      />
      <label htmlFor="password">Password</label>
      <div className={styles["password-input-container"]}>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="•••••••••"
          type={passwordVisible ? "text" : "password"}
          name="password"
          id="password"
          className={styles["password-input"]}
        />
        <button
          className={styles["show-password-button"]}
          type="button"
          tabIndex={-1}
          onClick={() => setPasswordVisible((currentVal) => !currentVal)}
        >
          {passwordVisible ? "Hide" : "Show"}
        </button>
      </div>
      <Balancer className={styles.agreement}>
        By clicking Log In, you agree to our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
        <Link href="/terms-of-service">Terms of service</Link>
      </Balancer>
      <input type="submit" value="Log in" readOnly />
    </form>
  );
};

export default SignUpForm;
