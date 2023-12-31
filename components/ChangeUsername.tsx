import { SettingsPageComponentPropsType } from "@/types/ComponentTypes";
import { getFormValues, getNewReference } from "@/utils/utils";
import { UsernameSchema } from "@/utils/zod";
import { FormEvent, useRef } from "react";
import { toast } from "sonner";

const UsernameSettingsComponent = ({
  user,
  setUser,
  styles,
}: SettingsPageComponentPropsType) => {
  const usernameForm = useRef<HTMLFormElement>(null);

  async function changeUsername(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formValues = getFormValues(e);
    const newUsername = formValues["new-username"] as string;

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

    if (newUsername.toUpperCase() === user.username.toUpperCase()) {
      return toast.error("This is already your username");
    }

    const loadingToastID = toast.loading("Loading", {
      duration: Infinity,
    });

    const submitButton = usernameForm.current?.lastChild as HTMLInputElement;
    submitButton.value = "...";
    submitButton.disabled = true;

    const res = await fetch("/api/user/change/username", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        newUsername,
      }),
    });
    const data = await res.json();

    submitButton.disabled = false;
    submitButton.value = "Submit";

    switch (data.message) {
      case "Success":
        usernameForm.current?.reset();
        const currentUser = getNewReference(user);
        currentUser.username = newUsername.toUpperCase();
        setUser(currentUser);
        toast.success("Username changed successfully", {
          id: loadingToastID,
        });
        break;
      case "This username is already taken":
        toast.error(data.message, {
          id: loadingToastID,
        });
        setUser(user);
        break;
      case "This is already your username":
        toast.error(data.message, {
          id: loadingToastID,
        });
        setUser(user);
        break;
      case "Error":
        toast.error("An unexpected error occurred, please try again", {
          id: loadingToastID,
        });
        setUser(user);
        break;
      default:
        toast.error("An unexpected error occurred, please try again", {
          id: loadingToastID,
        });
        setUser(user);
        break;
    }
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

export default UsernameSettingsComponent;
