import { useState, useEffect } from "react";
import { Text, Button } from "@arwes/core";
import ReactModal from "react-modal";
import RoomList from "./components/RoomList";
import NewRoomConfig from "./components/NewRoomConfig";
import NewProfileConfig from "./components/NewProfileConfig";
import { view } from "@risingstack/react-easy-state";
import appStore from "./store";

const customStyles = {
  content: {
    width: "400px",
    padding: "0px",
    position: "unset",
    border: "unset",
    inset: "50% auto auto 50%",
    margin: "0 auto",
    transform: "translateY(30vh)",
    backgroundColor: "#052f37",
  },
};

ReactModal.setAppElement("#app");

const Home = () => {
  const [openNewRoomModal, setNewRoomModal] = useState(false);
  const [openProfileModal, setProfileModal] = useState(appStore.newUser);

  const closeModal = (type) => {
    if (type === "profile") {
      setProfileModal(false);
    } else if (type === "room") {
      setNewRoomModal(false);
    }
  };

  return (
    <div className="homepage">
      <div className="create-room-action">
        <Button palette="primary" onClick={() => setNewRoomModal(true)}>
          <Text>Create Room</Text>
        </Button>
      </div>
      {appStore.rooms.length > 0 && <RoomList list={appStore.rooms} />}
      <ReactModal
        isOpen={openProfileModal}
        ariaHideApp={false}
        style={customStyles}
        contentLabel={"Update Profile"}
      >
        <NewProfileConfig close={closeModal} />
      </ReactModal>
      <ReactModal
        isOpen={openNewRoomModal}
        ariaHideApp={false}
        style={customStyles}
        contentLabel={"Create New Room"}
      >
        <NewRoomConfig close={closeModal} />
      </ReactModal>
    </div>
  );
};

export default view(Home);
