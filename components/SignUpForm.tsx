"use client";

import styles from "@/styles/signup.module.css";
import { encryptString } from "@/utils/encryption";
import { PasswordSchema, UsernameSchema } from "@/utils/zod";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import Balancer from "react-wrap-balancer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const router = useRouter();
  const [passwordVisibile, setPasswordVisibile] = useState<boolean>(false);
  const [repeatedPasswordVisibile, setRepeatedPasswordVisibile] =
    useState<boolean>(false);
  const AgreementCheckbox = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [repeatedPassword, setRepeatedPassword] = useState<string>("");

  function checkValues() {
    let results: boolean[] = [];
    let result = UsernameSchema.safeParse(username);
    results.push(result.success);
    if (!result.success) toast.error(result.error.format()._errors[0]);

    result = PasswordSchema.safeParse(password);
    results.push(result.success);
    if (!result.success) toast.error(result.error.format()._errors[0]);

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
      <div className={styles["password-input-container"]}>
        <input
          value={repeatedPassword}
          onChange={(e) => setRepeatedPassword(e.target.value)}
          placeholder="Repeat password"
          type={repeatedPasswordVisibile ? "text" : "password"}
          name="repeated-password"
          id={styles["password-input"]}
        />
        <button
          className={styles["show-password-button"]}
          type="button"
          tabIndex={-1}
          onClick={() =>
            setRepeatedPasswordVisibile((currentVal) => !currentVal)
          }
        >
          {repeatedPasswordVisibile ? "Hide" : "Show"}
        </button>
      </div>
      <Balancer ratio={0.7} preferNative={false} className={styles.agreement}>
        Do you agree to our <Link href="/privacy-policy">Privacy Policy</Link>{" "}
        and <Link href="/terms-of-service">Terms of service</Link>
        {"   "}
        <input type="checkbox" ref={AgreementCheckbox} />
      </Balancer>
      <input type="submit" value="Sign up" readOnly />
    </form>
  );
};

export default SignUpForm;
