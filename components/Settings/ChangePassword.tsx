import setPassword from "@/actions/settings/password";
import { SettingsPageComponentPropsType } from "@/types/ComponentTypes";
import { getNewReference } from "@/utils/utils";
import { PasswordSchema } from "@/utils/zod";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";

const ChangePassword = ({
  user,
  styles,
  setUser,
  userKey,
}: SettingsPageComponentPropsType) => {
  const passwordForm = useRef<HTMLFormElement>(null);

  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  const [newPasswordVisible, setNewPasswordVisible] = useState<boolean>(false);
  const [currentPasswordVisible, setCurrentPasswordVisible] =
    useState<boolean>(false);
  const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] =
    useState<boolean>(false);

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setNewPasswordVisible(false);
    setCurrentPasswordVisible(false);
    setConfirmNewPasswordVisible(false);

    if (oldPassword === "") {
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

    const result = await setPassword(
      userKey,
      oldPassword,
      user.password,
      newPassword
    );

    submitButton.disabled = false;
    submitButton.value = "Submit";

    if (result.message === "Success") {
      toast.success("Successfully changed password", {
        id: loadingToastID,
      });
      setNewPassword("");
      setOldPassword("");
      setConfirmNewPassword("");
      const currentUser = getNewReference(user);
      currentUser.password = result.hashedPassword;
      setUser(currentUser);
    } else {
      toast.error("Invalid password", {
        id: loadingToastID,
      });
    }

    setTimeout(() => toast.dismiss(loadingToastID), 2000);
  }

  return (
    <div className={styles.section}>
      <p>Change Password</p>
      <form
        ref={passwordForm}
        onSubmit={changePassword}
        className={styles.form}
      >
        <label htmlFor="current-password">Current Password</label>
        <div className={styles["password-input-container"]}>
          <input
            id="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
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

export default ChangePassword;
