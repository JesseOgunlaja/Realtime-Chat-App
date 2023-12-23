import SignUpForm from "@/components/SignUpForm";
import styles from "@/styles/signup.module.css";
import Link from "next/link";

const Page = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Sign up</h1>
        <SignUpForm />
        <div className={styles["has-an-account-container"]}>
          <p className={styles["has-an-account"]}>Already have an account?</p>
          <p className={styles["log-in-now"]}>
            <Link href="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
