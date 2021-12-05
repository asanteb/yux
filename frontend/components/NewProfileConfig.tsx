import { useState } from "react";
import { Text, Card, Button } from "@arwes/core";
import { view } from "@risingstack/react-easy-state";
import appStore from "../store";
import { randomNameGenerator } from "../modules/text-generator";

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

  const generate = () => {
    setName(randomNameGenerator());
    setAvatar(randomAvatarGenerator());
  };

  const saveSettings = () => {
    appStore.updateProfile({ name, avatar });
    close();
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
            <Button palette="error" onClick={() => close()}>
              <Text>Cancel</Text>
            </Button>
            <Button palette="secondary" onClick={() => generate()}>
              <Text>Generate</Text>
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
