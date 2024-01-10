import sendFriendRequest from "@/actions/friend/requests/send";
import styles from "@/styles/add-friend.module.css";
import { getUser, getUserDetailsList, getUserKey } from "@/utils/zustand";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";

const AddFriendComponent = () => {
  const user = getUser();
  const userKey = getUserKey();
  const userDetailsList = getUserDetailsList();

  const [friendBeingAddedUsername, setFriendBeingAddedUsername] =
    useState<string>("");
  const submitButtonRef = useRef<HTMLInputElement>(null);

  async function addFriend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitButtonRef.current!.disabled = true;
    submitButtonRef.current!.value = "...";

    if (friendBeingAddedUsername === "") {
      submitButtonRef.current!.disabled = false;
      submitButtonRef.current!.value = "Add";

      return toast.error("Please enter a username");
    }
    if (friendBeingAddedUsername.toLowerCase() === user.username) {
      submitButtonRef.current!.disabled = false;
      submitButtonRef.current!.value = "Add";

      return toast.error("You can't friend yourself");
    }

    const loadingToastID = toast.loading("Loading", {
      duration: Infinity,
    });

    const result = await sendFriendRequest(
      userKey,
      user,
      userDetailsList,
      friendBeingAddedUsername
    );

    submitButtonRef.current!.value = "Add";
    submitButtonRef.current!.disabled = false;

    switch (result.message) {
      case "Success":
        setFriendBeingAddedUsername("");
        toast.success("Your friend request was sent successfully", {
          id: loadingToastID,
        });
        break;
      case "User not found":
        toast.error("No user with that username was found", {
          id: loadingToastID,
        });
        break;
      case "You've already sent this user a friend request":
        toast.error(result.message, {
          id: loadingToastID,
        });
        break;
      case "This user has already sent you a friend request":
        toast.error(result.message, {
          id: loadingToastID,
        });
        break;
      case "This user is already your friend":
        toast.error(result.message, {
          id: loadingToastID,
        });
    }

    setTimeout(() => {
      toast.dismiss(loadingToastID);
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
            value={friendBeingAddedUsername}
            onChange={(e) => setFriendBeingAddedUsername(e.target.value)}
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
