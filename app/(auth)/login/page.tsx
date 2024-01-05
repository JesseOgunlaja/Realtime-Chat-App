import LogInForm from "@/components/Auth/LogInForm";
import styles from "@/styles/signup.module.css";
import Link from "next/link";

const Page = () => {
  return (
    <div className={styles.page}>
      <div style={{ paddingBottom: "70px" }} className={styles.container}>
        <h1 className={styles.title}>
          Log in to <span>WhisperNet</span>
        </h1>
        <LogInForm />
        <div className={styles["no-account-container"]}>
          <p className={styles["no-account"]}>
            Don&apos;t have an account? <Link href="/signup"> Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
