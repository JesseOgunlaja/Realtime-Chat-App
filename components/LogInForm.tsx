"use client";

import styles from "@/styles/signup.module.css";
import { decodeJWT, signJWT } from "@/utils/auth";
import { decryptString, encryptString } from "@/utils/encryption";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import Balancer from "react-wrap-balancer";
import { toast } from "sonner";

const SignUpForm = () => {
  const rememberMeCheckbox = useRef<HTMLInputElement>(null);
  const [passwordVisibile, setPasswordVisibile] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    (async function () {
      const res = await fetch("/api/credentials");
      const data = await res.json();
      const credentials = data.credentials;
      if (!credentials) {
        return;
      }
      const decoded = await decodeJWT(String(credentials));
      if (!decoded) return;
      const payload = decoded.payload;
      if (!payload || !payload.username || !payload.password) return;
      setUsername(decryptString(String(payload.username), true));
      setPassword(decryptString(String(payload.password), true));
      rememberMeCheckbox.current!.checked = true;
    })();
  }, []);

  function checkValues() {
    let results: boolean[] = [];
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
        if (rememberMeCheckbox.current?.checked) {
          const payload = {
            username: encryptString(String(username), true),
            password: encryptString(String(password), true),
          };
          const userCredentials = signJWT(payload, "30d");

          await fetch("/api/credentials", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              credentials: userCredentials,
            }),
          });
        } else {
          await fetch("/api/credentials", {
            method: "DELETE",
          });
        }
        setTimeout(async () => {
          toast.dismiss(loadingToastID);
          window.location.reload();
        }, 2000);
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
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        type="text"
        name="username"
        id="username"
      />
      <div className={styles["password-input-container"]}>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type={passwordVisibile ? "text" : "password"}
          name="password"
          className={styles["password-input"]}
        />
        <button
          className={styles["show-password-button"]}
          type="button"
          tabIndex={-1}
          onClick={() => setPasswordVisibile((currentVal) => !currentVal)}
        >
          {passwordVisibile ? "Hide" : "Show"}
        </button>
      </div>
      <div className={styles["remember-me-container"]}>
        <p className={styles["remember-me-text"]}>Remember me</p>
        <input
          ref={rememberMeCheckbox}
          className={styles["remember-me-checkbox"]}
          type="checkbox"
        />
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
