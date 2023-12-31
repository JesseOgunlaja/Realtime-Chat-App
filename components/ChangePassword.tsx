import { SettingsPageComponentPropsType } from "@/types/ComponentTypes";
import { encryptString } from "@/utils/encryption";
import { getNewReference } from "@/utils/utils";
import { PasswordSchema } from "@/utils/zod";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";

const PasswordSettingsComponent = ({
  user,
  setUser,
  styles,
}: SettingsPageComponentPropsType) => {
  const passwordForm = useRef<HTMLFormElement>(null);

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  const [newPasswordVisible, setNewPasswordVisible] = useState<boolean>(false);
  const [currentPasswordVisible, setCurrentPasswordVisible] =
    useState<boolean>(false);
  const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] =
    useState<boolean>(false);

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (currentPassword === "") {
      return toast.error("Current password required");
    }

    if (newPassword === "") {
      return toast.error("Password required");
    }

    if (newPassword !== confirmNewPassword) {
      return toast.error("Passwords don't match");
    }

    const schemaResult = PasswordSchema.safeParse(newPassword);

    if (!schemaResult.success) {
      schemaResult.error.format()._errors.forEach((error) => {
        return toast.error(error);
      });
      return;
    }

    const loadingToastID = toast.loading("Loading", {
      duration: Infinity,
    });

    const submitButton = passwordForm.current?.lastChild as HTMLInputElement;
    submitButton.value = "...";
    submitButton.disabled = true;

    setNewPasswordVisible(false);
    setCurrentPasswordVisible(false);
    setConfirmNewPasswordVisible(false);

    const res = await fetch("/api/user/change/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: encryptString(currentPassword, true),
        newPassword: encryptString(newPassword, true),
        encrypted: true,
      }),
    });
    const data = await res.json();

    submitButton.disabled = false;
    submitButton.value = "Submit";

    switch (data.message) {
      case "Success":
        toast.success("Successfully changed password", {
          id: loadingToastID,
        });
        setNewPassword("");
        setCurrentPassword("");
        setConfirmNewPassword("");
        const currentUser = getNewReference(user);
        currentUser.password = data.hashedPassword;
        setUser(currentUser);
        break;
      case "Incorrect password":
        toast.error("Incorrect password", {
          id: loadingToastID,
        });
        break;
      case "Error":
        toast.error("An unexpected error occured. Please try again", {
          id: loadingToastID,
        });
        break;
      default:
        toast.error("An unexpected error occured. Please try again", {
          id: loadingToastID,
        });
        break;
    }
    setTimeout(() => toast.dismiss(loadingToastID), 2000);
  }

  return (
    <div className={styles.section}>
      <p>Change password</p>
      <form
        ref={passwordForm}
        onSubmit={changePassword}
        className={styles.form}
      >
        <label htmlFor="current-password">Current Password</label>
        <div className={styles["password-input-container"]}>
          <input
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            type={currentPasswordVisible ? "text" : "password"}
            name="current-password"
            className={styles["password-input"]}
          />
          <button
            className={styles["show-password-button"]}
            type="button"
            tabIndex={-1}
            onClick={() =>
              setCurrentPasswordVisible((currentVal) => !currentVal)
            }
          >
            {currentPasswordVisible ? "Hide" : "Show"}
          </button>
        </div>

        <label htmlFor="new-password">New Password</label>

        <div className={styles["password-input-container"]}>
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type={newPasswordVisible ? "text" : "password"}
            name="new-password"
            id="new-password"
            className={styles["password-input"]}
          />
          <button
            className={styles["show-password-button"]}
            type="button"
            tabIndex={-1}
            onClick={() => setNewPasswordVisible((currentVal) => !currentVal)}
          >
            {newPasswordVisible ? "Hide" : "Show"}
          </button>
        </div>

        <label htmlFor="confirm-new-password">Comfirm New Password</label>
        <div className={styles["password-input-container"]}>
          <input
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            type={confirmNewPasswordVisible ? "text" : "password"}
            name="new-password"
            id="confirm-new-password"
            className={styles["password-input"]}
          />
          <button
            className={styles["show-password-button"]}
            type="button"
            tabIndex={-1}
            onClick={() =>
              setConfirmNewPasswordVisible((currentVal) => !currentVal)
            }
          >
            {confirmNewPasswordVisible ? "Hide" : "Show"}
          </button>
        </div>

        <input value="Submit" type="submit" />
      </form>
    </div>
  );
};

export default PasswordSettingsComponent;
