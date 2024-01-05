import SignUpForm from "@/components/Auth/SignUpForm";
import styles from "@/styles/signup.module.css";
import Link from "next/link";

const Page = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Sign up to <span>WhisperNet</span>
        </h1>
        <SignUpForm />
        <div className={styles["has-an-account-container"]}>
          <p className={styles["has-an-account"]}>
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
