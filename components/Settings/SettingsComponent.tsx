import styles from "@/styles/settings.module.css";
import { ProtectedPageComponentPropsType } from "@/types/ComponentTypes";
import ChangeDisplayName from "./ChangeDisplayName";
import ChangePassword from "./ChangePassword";
import ChangeProfilePicture from "./ChangeProfilePicture";
import ChangeUsername from "./ChangeUsername";

const SettingsComponent = ({
  user,
  setUser,
  userKey,
  usernamesList,
  setUsernamesList,
}: ProtectedPageComponentPropsType) => {
  return (
    <div className={styles.page}>
      <h1>Settings</h1>
      <div className={styles.sections}>
        <ChangeUsername
          userKey={userKey}
          user={user}
          setUser={setUser}
          styles={styles}
          usernamesList={usernamesList}
          setUsernamesList={setUsernamesList}
        />
        <ChangeDisplayName
          userKey={userKey}
          user={user}
          setUser={setUser}
          styles={styles}
          usernamesList={usernamesList}
          setUsernamesList={setUsernamesList}
        />
        <ChangePassword
          userKey={userKey}
          user={user}
          setUser={setUser}
          styles={styles}
          usernamesList={usernamesList}
          setUsernamesList={setUsernamesList}
        />
        <ChangeProfilePicture
          userKey={userKey}
          user={user}
          setUser={setUser}
          styles={styles}
          usernamesList={usernamesList}
          setUsernamesList={setUsernamesList}
        />
      </div>
    </div>
  );
};

export default SettingsComponent;
