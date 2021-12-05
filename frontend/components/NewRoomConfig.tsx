import { useState } from "react";
import { Text, Card, Button, FrameBox } from "@arwes/core";
import {
  randomRoomImageGenerator,
  encodeImageFileAsURL,
} from "../modules/image-generator";

import {
  randomRoomNameGenerator,
  randomDescriptionGenerator,
} from "../modules/text-generator";

const NewRoomConfig = ({ close }) => {
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [roomImage, setRoomImage] = useState(randomRoomImageGenerator());

  const uploadImage = (el) => {
    encodeImageFileAsURL(el).then((img) => setRoomImage(img as string));
    //  Clear file input el.value = null;
  };

  const generate = () => {
    setRoomName(randomRoomNameGenerator());
    setDescription(randomDescriptionGenerator());
    setRoomImage(randomRoomImageGenerator());
  };

  return (
    <div className="new-room-config">
      <Card
        animator={{ manager: "stagger" }}
        image={{
          src: roomImage,
          alt: "Room Image",
        }}
        title="Create New Room"
        options={
          <div>
            <Button palette="error" onClick={() => close()}>
              <Text>Cancel</Text>
            </Button>
            <Button palette="secondary" onClick={() => generate()}>
              <Text>Generate</Text>
            </Button>
            <Button palette="success">
              <Text>Create Room</Text>
            </Button>
          </div>
        }
        style={{ maxWidth: 400 }}
      >
        <div>
          <input
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div style={{ marginTop: "18px" }}>
            <Text>Upload new room image (Optional)</Text>
          </div>
          <input type="file" onChange={(e) => uploadImage(e.target)} />
        </div>
      </Card>
    </div>
  );
};

export default NewRoomConfig;
