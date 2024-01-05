import { setProfilePicture } from "@/actions/settingsActions";
import { SettingsPageComponentPropsType } from "@/types/ComponentTypes";
import { getNewReference } from "@/utils/utils";
import { PickerOverlay } from "filestack-react";
import { useState } from "react";

const ChangeProfilePicture = ({
  user,
  setUser,
  styles,
  userKey,
  usernamesList,
}: SettingsPageComponentPropsType) => {
  const [pickerShown, setPickerShown] = useState<boolean>(false);

  return (
    <div className={styles.section}>
      <p>Change Profile Picture</p>
      <button
        onClick={() => setPickerShown(true)}
        className={styles["upload-image"]}
      >
        Upload Image
      </button>
      {pickerShown && (
        <PickerOverlay
          apikey={process.env.NEXT_PUBLIC_FILESTACK_API_KEY}
          pickerOptions={{
            accept: ["image/*"],
            maxFiles: 1,
            maxSize: 3 * 1024 * 1024,
            fromSources: ["local_file_system"],
            onClose: () => {
              setPickerShown(false);
            },
            transformations: {
              force: true,
              circle: true,
              crop: false,
            },
            onUploadDone: async (res) => {
              const profilePictureURL = res.filesUploaded[0].url;

              const currentUser = getNewReference(user);
              currentUser.profilePicture = profilePictureURL;
              setUser(currentUser);

              await setProfilePicture(
                userKey,
                usernamesList,
                profilePictureURL
              );
            },
          }}
        />
      )}
    </div>
  );
};

export default ChangeProfilePicture;
