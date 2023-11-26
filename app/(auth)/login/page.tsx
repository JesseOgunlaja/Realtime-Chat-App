import LogInForm from "@/components/LogInForm";
import styles from "@/styles/signup.module.css";
import Link from "next/link";

const Page = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Log in</h1>
        <LogInForm />
        <div className={styles["no-account-container"]}>
          <p className={styles["no-account"]}>Don&apos;t have an account?</p>
          <p className={styles["sign-up-now"]}>
            Sign up <Link href="/signup">here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
