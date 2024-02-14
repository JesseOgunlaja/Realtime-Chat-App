"use client";

import setUsername from "@/actions/settings/username";
import styles from "@/styles/settings.module.css";
import { getFormValues, getNewReference } from "@/utils/utils";
import { UsernameSchema } from "@/utils/zod";
import {
  UserDetailsStore,
  UserStore,
  getUser,
  getUserDetailsList,
  getUserKey,
} from "@/utils/zustand";
import { FormEvent, useRef } from "react";
import { toast } from "sonner";

const ChangeUsername = () => {
  const user = getUser();
  const userKey = getUserKey();
  const userDetailsList = getUserDetailsList();

  const { setUser } = UserStore((state) => state);
  const { setUserDetailsList } = UserDetailsStore((state) => state);

  const usernameForm = useRef<HTMLFormElement>(null);

  async function changeUsername(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formValues = getFormValues(e);
    const newUsername = (formValues["new-username"] as string).toLowerCase();

    if (newUsername === "") {
      return toast.error("Username required");
    }

    const schemaResult = UsernameSchema.safeParse(newUsername);

    if (!schemaResult.success) {
      schemaResult.error.format()._errors.forEach((error) => {
        return toast.error(error);
      });
      return;
    }

    if (newUsername === user.username) {
      return toast.error("This is already your username");
    }

    if (userDetailsList.findIndex((val) => val.name === newUsername) !== -1) {
      return toast.error("Username taken");
    }

    const loadingToastID = toast.loading("Loading", {
      duration: Infinity,
    });

    const submitButton = usernameForm.current?.lastChild as HTMLInputElement;
    submitButton.value = "...";
    submitButton.disabled = true;

    const result = await setUsername(userKey, userDetailsList, newUsername);

    submitButton.disabled = false;
    submitButton.value = "Submit";

    usernameForm.current?.reset();
    const currentUser = getNewReference(user);
    currentUser.username = newUsername.toLowerCase();
    setUser(currentUser);
    setUserDetailsList(result.newUsernamesList);
    toast.success("Username changed successfully", {
      id: loadingToastID,
    });

    setTimeout(() => {
      toast.dismiss(loadingToastID);
    }, 2000);
  }

  return (
    <div className={styles.section}>
      <p>Change Username</p>
      <form
        ref={usernameForm}
        onSubmit={changeUsername}
        className={styles.form}
      >
        <label htmlFor="new-username">New Username</label>
        <input
          name="new-username"
          id="new-username"
          type="text"
          autoComplete="off"
        />
        <input type="submit" />
      </form>
    </div>
  );
};

export default ChangeUsername;
