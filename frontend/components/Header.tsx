import { useState } from "react";
import { Text } from "@arwes/core";
import ReactModal from "react-modal";
import NewProfileConfig from "./NewProfileConfig";
import { view } from "@risingstack/react-easy-state";
import appStore from "../store";

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

const Header = () => {
  const [openProfileModal, setProfileModal] = useState(appStore.newUser);

  const closeModal = () => {
    setProfileModal(false);
  };

  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="main-header">
      <Text as="h1" animator={{ manager: "stagger" }}>
        <span className="link" onClick={() => goHome()}>
          yux.watch
        </span>
      </Text>
      <div className="vertical-center">
        <a
          className="source-code-link vertical-center"
          href="https://github.com/asanteb/yux"
        >
          <div
            style={{ width: "24px", marginBottom: "-4px", marginRight: "6px" }}
          >
            <span className="material-icons">code</span>
          </div>
          <div>Source Code</div>
        </a>

        <span
          style={{ marginRight: "14px" }}
          className="material-icons link"
          onClick={() => setProfileModal(true)}
        >
          settings
        </span>
      </div>
      <ReactModal
        isOpen={openProfileModal}
        ariaHideApp={false}
        style={customStyles}
        contentLabel={"Update Profile"}
      >
        <NewProfileConfig close={closeModal} />
      </ReactModal>
    </div>
  );
};

export default view(Header);
