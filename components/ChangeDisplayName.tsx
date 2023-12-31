import { SettingsPageComponentPropsType } from "@/types/ComponentTypes";
import { getFormValues, getNewReference } from "@/utils/utils";
import { DisplayNameSchema } from "@/utils/zod";
import { FormEvent, useRef } from "react";
import { toast } from "sonner";

const DisplayNameSettingsComponent = ({
  user,
  setUser,
  styles,
}: SettingsPageComponentPropsType) => {
  const displayNameForm = useRef<HTMLFormElement>(null);

  async function changeDisplayName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formValues = getFormValues(e);
    const newDisplayName = formValues["new-display-name"] as string;

    if (newDisplayName === "") {
      return toast.error("Display name required");
    }

    const schemaResult = DisplayNameSchema.safeParse(newDisplayName);

    if (!schemaResult.success) {
      schemaResult.error.format()._errors.forEach((error) => {
        return toast.error(error);
      });
      return;
    }

    if (newDisplayName === user.displayName) {
      return toast.error("This is already your display name");
    }

    const loadingToastID = toast.loading("Loading", {
      duration: Infinity,
    });

    const submitButton = displayNameForm.current?.lastChild as HTMLInputElement;
    submitButton.value = "...";
    submitButton.disabled = true;

    const res = await fetch("/api/user/change/display-name", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        newDisplayName,
      }),
    });
    const data = await res.json();

    submitButton.disabled = false;
    submitButton.value = "Submit";

    switch (data.message) {
      case "Success":
        displayNameForm.current?.reset();
        const currentUser = getNewReference(user);
        currentUser.displayName = newDisplayName;
        setUser(currentUser);
        toast.success("Display name changed successfully", {
          id: loadingToastID,
        });
        break;
      case "This is already your display name":
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
      <p>Change Display Name</p>
      <form
        ref={displayNameForm}
        onSubmit={changeDisplayName}
        className={styles.form}
      >
        <label htmlFor="new-display-name">New Display Name</label>
        <input
          name="new-display-name"
          id="new-display-name"
          type="text"
          autoComplete="off"
        />
        <input type="submit" />
      </form>
    </div>
  );
};

export default DisplayNameSettingsComponent;
