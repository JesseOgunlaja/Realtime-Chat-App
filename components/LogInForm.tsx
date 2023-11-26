"use client";

import styles from "@/styles/signup.module.css";
import { decryptString, encryptString } from "@/utils/encryption";
import Link from "next/link";
import { FormEvent, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { decodeJWT, signJWT } from "@/utils/auth";
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const router = useRouter();
  const rememberMeCheckbox = useRef<HTMLInputElement>(null);
  const [passwordVisibile, setPasswordVisibile] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    async function getCredentials() {
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
      rememberMeCheckbox.current!.checked = true;
      setPassword(decryptString(String(payload.password), true));
    }
    getCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          router.push("/dashboard");
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
          id={styles["password-input"]}
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
      <p className={styles.agreement}>
        By clicking log in you agree to our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
        <Link href="/terms-of-service">Terms of service</Link>
      </p>
      <input type="submit" value="Log in" readOnly />
    </form>
  );
};

export default SignUpForm;
