import styles from "@/styles/home.module.css";
import Link from "next/link";
import Balancer from "react-wrap-balancer";

export default async function Home() {
  return (
    <div className={styles.container}>
      <h1 style={{ fontSize: "1px", color: "transparent", userSelect: "none" }}>
        WhisperNet
      </h1>
      <h2 className={styles.catchphrase}>Chat. Connect. Create.</h2>
      <Balancer className={styles.description}>
        The ability to communicate at the tip of your finger.
      </Balancer>
      <br />
      <Link href="/signup" className={styles["start-now"]}>
        Get started for free
      </Link>
      <div className={styles["selling-points"]}>
        <div className={styles["selling-point"]}>
          <p className={styles["selling-point-title"]}>Realtime Chats</p>
          <p className={styles["selling-point-description"]}>
            Our lightning fast servers allows you to communicate with your
            friends in realtime.
          </p>
        </div>
        <div className={styles["selling-point"]}>
          <p className={styles["selling-point-title"]}>Secure encryption</p>
          <p className={styles["selling-point-description"]}>
            Our end to end encryption allows us to keep your data safe from
            attackers.
          </p>
        </div>
        <div className={styles["selling-point"]}>
          <p className={styles["selling-point-title"]}>Flawless Accesibility</p>
          <p className={styles["selling-point-description"]}>
            Our chat features allow your chats to always be accessible at any
            time in any place.
          </p>
        </div>
      </div>
      <div className={styles["our-goal"]}>
        <p className={styles["our-goal-title"]}>
          Enabling Universal Communication
        </p>
        <Balancer className={styles["our-goal-description"]}>
          My goal is to allow people to commuincate with others all around the
          world safely and securely, and most importantly for free.
        </Balancer>
      </div>
    </div>
  );
}
