import styles from "@/styles/add-friend.module.css";
import { ProtectedPageComponentPropsType } from "@/types/ComponentTypes";
import { getNewReference } from "@/utils/utils";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";

const AddFriendComponent = ({
  user,
  setUser,
}: ProtectedPageComponentPropsType) => {
  const [friendBeingAdded, setFriendBeingAdded] = useState<string>("");
  const submitButtonRef = useRef<HTMLInputElement>(null);

  async function addFriend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitButtonRef.current!.disabled = true;
    submitButtonRef.current!.value = "...";

    if (friendBeingAdded === "") {
      submitButtonRef.current!.disabled = false;
      submitButtonRef.current!.value = "Add";

      return toast.error("Invalid username submitted");
    }
    if (friendBeingAdded.toLowerCase() === user.username) {
      submitButtonRef.current!.disabled = false;
      submitButtonRef.current!.value = "Add";

      return toast.error("You can't friend yourself");
    }

    const loadingToastID = toast.loading("Loading", {
      duration: Infinity,
    });
    const res = await fetch("/api/friends/requests/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernameBeingBefriended: friendBeingAdded,
      }),
    });
    const data = await res.json();
    if (data.message === "Success") {
      const currentUser = getNewReference(user);
      user!.outgoingFriendRequests = data.newOutgoingFriendRequests;
      setUser(currentUser);
      toast.success("Your friend request was sent successfully", {
        id: loadingToastID,
      });
    } else if (data.message === "User doesn't exist") {
      toast.error("No user with that username was found", {
        id: loadingToastID,
      });
    } else if (data.message === "You've already added this user as a friend") {
      toast.error("This user's already your friend", {
        id: loadingToastID,
      });
    } else if (
      data.message === "You've already sent this user a friend request"
    ) {
      toast.error(data.message, {
        id: loadingToastID,
      });
    } else if (data.message === "This user has sent you a friend request") {
      toast.error(data.message, {
        id: loadingToastID,
      });
    } else if (data.message === "Error") {
      toast.error("An unexpected error occurred, please try again", {
        id: loadingToastID,
      });
    } else {
      toast.error("An unexpected error occurred, please try again", {
        id: loadingToastID,
      });
    }
    setTimeout(() => {
      toast.dismiss(loadingToastID);
      submitButtonRef.current!.value = "Add";
      submitButtonRef.current!.disabled = false;
      setFriendBeingAdded("");
    }, 1000);
  }

  return (
    <div className={styles.page}>
      <style jsx global>{`
        body {
          justify-content: flex-start;
          overflow: hidden;
        }
      `}</style>
      <h1 className={styles.title}>Add a friend</h1>
      <form onSubmit={addFriend} className={styles.form}>
        <label htmlFor="add-friend">Add friend by username</label>
        <div className={styles["add-friend-container"]}>
          <input
            autoFocus
            value={friendBeingAdded}
            onChange={(e) => setFriendBeingAdded(e.target.value)}
            className={styles["text-input"]}
            type="text"
            name="add-friend"
            id="add-friend"
            placeholder="Jesse"
          />
          <input
            ref={submitButtonRef}
            className={styles["submit-button"]}
            type="submit"
            value="Add"
            readOnly
          />
          <p>Hint: My username is &quot;Jesse&quot;</p>
        </div>
      </form>
    </div>
  );
};

export default AddFriendComponent;
