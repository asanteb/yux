import { useState, useEffect } from "react";
import { Text, Card, Button, FrameBox } from "@arwes/core";
import { view } from "@risingstack/react-easy-state";
import appStore from "../store";

import {
  randomAvatarGenerator,
  encodeImageFileAsURL,
} from "../modules/image-generator";

const NewProfileConfig = ({ close }) => {
  const [name, setName] = useState(appStore.name);
  const [avatar, setAvatar] = useState(
    appStore.avatar || randomAvatarGenerator()
  );

  const uploadImage = (el) => {
    encodeImageFileAsURL(el).then((img) => setAvatar(img as string));
    //  Clear file input el.value = null;
  };

  const saveSettings = () => {
    appStore.updateProfile({ name, avatar });
  };

  return (
    <div className="new-profile-config">
      <Card
        animator={{ manager: "stagger" }}
        image={{
          src: avatar,
          alt: "avatar",
        }}
        title="Update User Profile"
        options={
          <div>
            <Button palette="error" onClick={() => close("profile")}>
              <Text>Cancel</Text>
            </Button>
            <Button palette="success" onClick={() => saveSettings()}>
              <Text>Save Profile</Text>
            </Button>
          </div>
        }
        style={{ maxWidth: 400 }}
      >
        <div>
          <input
            type="text"
            placeholder="Anon User"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div style={{ marginTop: "18px" }}>
            <Text>Upload Avatar (Optional)</Text>
          </div>
          <input type="file" onChange={(e) => uploadImage(e.target)} />
        </div>
      </Card>
    </div>
  );
};

export default view(NewProfileConfig);
