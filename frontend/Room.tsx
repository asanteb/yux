import React from "react";
import { Figure } from "@arwes/core";
import { omit } from "lodash";
import Peer from "peerjs";
import { view } from "@risingstack/react-easy-state";
import appStore from "./store";

class Room extends React.Component<any, any> {
  constructor(props) {
    super(props);

    const urlParams = new URLSearchParams(window.location.search);
    this.state = {
      roomId: appStore.roomConfig.id || urlParams.get("id"),
      roomName: appStore.roomConfig.name || "",
      roomImage: appStore.roomConfig.image || "",
      roomDescription: appStore.roomConfig.description || "",
      peers: {},
    };
  }

  componentDidMount() {
    const videoGrid = document.getElementById("video-grid");
    this.setState({ videoGrid });

    if (appStore.roomConfig.id) {
      this.createRoom();
    } else {
      this.joinRoom();
    }

    appStore.socket.on("user-disconnected", (peerId) => {
      if (this.state.peers[peerId]) {
        this.state.peers[peerId].close();
        this.setState({ peers: omit(this.state.peers, peerId) });
      }
    });
  }

  connectToNewUser(peerId, stream, myPeer) {
    const call = myPeer.call(peerId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      this.addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
      video.remove();
    });

    this.setState({ peers: { ...this.state.peers, [peerId]: call } });
  }

  addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    this.state.videoGrid.append(video);
  }

  createRoom() {
    const myVideo = document.createElement("video");
    const myPeer = new Peer();

    myPeer.on("open", function (peerId) {
      const config = {
        ...appStore.roomConfig,
        userToken: appStore.userToken,
        peerId,
        action: "create",
      };
      appStore.socket.emit("join-room", config);
      appStore.clearRoomConfig();
    });

    myVideo.muted = true;
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.addVideoStream(myVideo, stream);

        myPeer.on("call", (call) => {
          call.answer(stream);
          this.setState({ peers: { ...this.state.peers, [call.peer]: call } });
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            this.addVideoStream(video, userVideoStream);
          });
        });

        appStore.socket.on("room-presence", (room) => {
          console.log("Room Updated");
          this.setState({
            roomName: room.name,
            roomDescription: room.description,
            roomImage: room.image,
          });
        });

        appStore.socket.on("user-connected", (peerId) => {
          if (peerId !== myPeer.id && !this.state.peers[peerId]) {
            this.connectToNewUser(peerId, stream, myPeer);
          }
        });
      });
  }
  joinRoom() {
    const myVideo = document.createElement("video");
    const myPeer = new Peer();
    myPeer.on("open", (peerId) => {
      appStore.socket.emit("join-room", {
        id: this.state.roomId,
        peerId,
        userToken: appStore.userToken,
        action: "join",
      });
    });

    myVideo.muted = true;
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.addVideoStream(myVideo, stream);

        myPeer.on("call", (call) => {
          call.answer(stream);
          this.setState({ peers: { ...this.state.peers, [call.peer]: call } });
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            this.addVideoStream(video, userVideoStream);
          });
        });

        appStore.socket.on("room-presence", (room) => {
          this.setState({
            roomName: room.name,
            roomDescription: room.description,
            roomImage: room.image,
          });
        });

        appStore.socket.on("user-connected", (peerId) => {
          if (peerId !== myPeer.id && !this.state.peers[peerId]) {
            this.connectToNewUser(peerId, stream, myPeer);
          }
        });
      });
  }
  render() {
    return (
      <div>
        <div className="room-header">
          <div className="header-list">
            <h1>
              <span className="header-attr-style">Name:</span>{" "}
              {this.state.roomName}
            </h1>
            <h4>
              <span className="header-attr-style">Description:</span>{" "}
              {this.state.roomDescription}
            </h4>
            <h4>
              <span className="header-attr-style">RoomID:</span>{" "}
              {this.state.roomId}
            </h4>
          </div>
          <Figure src={this.state.roomImage} alt="Room Image"></Figure>
        </div>
        <div className="video-container">
          <div id="video-grid"></div>
        </div>
      </div>
    );
  }
}

export default view(Room);
