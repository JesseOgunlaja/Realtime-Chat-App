"use client";

import styles from "@/styles/signup.module.css";
import { encryptString } from "@/utils/encryption";
import { PasswordSchema, UsernameSchema } from "@/utils/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import Balancer from "react-wrap-balancer";
import { toast } from "sonner";

const SignUpForm = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [repeatedPasswordVisible, setRepeatedPasswordVisible] =
    useState<boolean>(false);
  const AgreementCheckbox = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [repeatedPassword, setRepeatedPassword] = useState<string>("");

  function checkValues() {
    const results: boolean[] = [];
    const usernameResult = UsernameSchema.safeParse(username);
    results.push(usernameResult.success);
    if (!usernameResult.success)
      toast.error(usernameResult.error.format()._errors[0]);

    const passwordResult = PasswordSchema.safeParse(password);
    results.push(passwordResult.success);
    if (!passwordResult.success)
      toast.error(passwordResult.error.format()._errors[0]);

    results.push(password === repeatedPassword);
    if (password !== repeatedPassword && results[1])
      toast.error("Passwords don't match");

    return results.every((val) => val === true);
  }

  async function addUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (checkValues()) {
      if (!AgreementCheckbox.current?.checked) {
        return toast.error(
          "In order to proceed, please agree to our Terms of Service and Privacy Policy"
        );
      }
      const loadingToastID = toast.loading("Loading", { duration: Infinity });
      const res = await fetch("/api/signup", {
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
        toast.success("User registered", {
          id: loadingToastID,
        });
        setTimeout(() => {
          toast.dismiss(loadingToastID);
          router.push("/login");
        }, 2000);
      }
      if (data.message === "Error") {
        if (data.error === "Duplicate username") {
          toast.error("Duplicate username", {
            id: loadingToastID,
          });
        } else {
          toast.error("An unexpected error occured please try again", {
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
      <label htmlFor="repeated-password">Confirm Password</label>
      <div className={styles["password-input-container"]}>
        <input
          value={repeatedPassword}
          onChange={(e) => setRepeatedPassword(e.target.value)}
          placeholder="•••••••••"
          type={repeatedPasswordVisible ? "text" : "password"}
          name="repeated-password"
          id="repeated-password"
          className={styles["password-input"]}
        />
        <button
          className={styles["show-password-button"]}
          type="button"
          tabIndex={-1}
          onClick={() =>
            setRepeatedPasswordVisible((currentVal) => !currentVal)
          }
        >
          {repeatedPasswordVisible ? "Hide" : "Show"}
        </button>
      </div>
      <Balancer preferNative={false} className={styles.agreement}>
        Do you agree to our <Link href="/privacy-policy">Privacy Policy</Link>{" "}
        and <Link href="/terms-of-service">Terms of service</Link>
        {"   "}
        <input
          type="checkbox"
          name="agreement-checkbox"
          ref={AgreementCheckbox}
        />
      </Balancer>
      <input type="submit" value="Sign up" readOnly />
    </form>
  );
};

export default SignUpForm;
