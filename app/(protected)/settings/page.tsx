import ChangeDisplayName from "@/components/Settings/ChangeDisplayName";
import ChangePassword from "@/components/Settings/ChangePassword";
import ChangeProfilePicture from "@/components/Settings/ChangeProfilePicture";
import ChangeUsername from "@/components/Settings/ChangeUsername";
import styles from "@/styles/settings.module.css";

const Page = () => {
  return (
    <div className={styles.page}>
      <h1>Settings</h1>
      <div className={styles.sections}>
        <ChangeUsername />
        <ChangeDisplayName />
        <ChangePassword />
        <ChangeProfilePicture />
      </div>
    </div>
  );
};

export default Page;
