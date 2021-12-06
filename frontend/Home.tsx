import { useState, useEffect } from "react";
import { Text, Button } from "@arwes/core";
import ReactModal from "react-modal";
import RoomList from "./components/RoomList";
import NewRoomConfig from "./components/NewRoomConfig";
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

  const closeModal = () => {
    setNewRoomModal(false);
  };

  return (
    <div className="homepage">
      <div style={{ textAlign: "center" }}>
        <Text>
          Yux.watch is a free open source cyberpunk video hangout. Create a room
          and try for yourself
        </Text>
      </div>
      <div className="create-room-action" style={{ margin: "16px" }}>
        <Button palette="primary" onClick={() => setNewRoomModal(true)}>
          <Text>Create New Room</Text>
        </Button>
      </div>
      {appStore.rooms.length > 0 && <RoomList list={appStore.rooms} />}
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
