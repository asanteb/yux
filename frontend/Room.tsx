import React from "react";
import { Button, Figure, FrameCorners, Text } from "@arwes/core";
import Peer from "peerjs";
import { view } from "@risingstack/react-easy-state";
import Chat from "./components/Chat";
import appStore from "./store";
import copy from "copy-to-clipboard";

declare global {
  interface Window {
    state: any;
  }
}

class Room extends React.Component<any, any> {
  constructor(props) {
    super(props);

    const urlParams = new URLSearchParams(window.location.search);
    this.state = {
      myPeerId: "",
      viewer: false, //!appStore.roomConfig.id && !urlParams.get("joinOnStart"),
      roomId: appStore.roomConfig.id || urlParams.get("id"),
      roomName: appStore.roomConfig.name || "",
      roomImage: appStore.roomConfig.image || "",
      roomDescription: appStore.roomConfig.description || "",
      peers: [],
      videoList: [],
      retry: false,
    };
    window.state = this.state;
  }

  componentDidMount() {
    const videoGrid = document.getElementById("video-grid");
    this.setState({ videoGrid });

    if (appStore.roomConfig.id) {
      this.createRoom();
    } else {
      this.joinRoom(this.state.viewer);
    }

    appStore.socket.on("user-disconnected", (peerId) => {
      const peers = this.state.peers;
      const videos = this.state.videoList;
      const videoIdx = this.state.videoList.findIndex(
        (v) => v.peerId === peerId
      );
      const peerIdx = this.state.peers.findIndex((v) => v.id === peerId);

      if (peerIdx > -1) {
        peers[peerIdx].call?.close();
        peers.splice(peerIdx, 1);
        this.setState({ peers });
      }

      if (videoIdx > -1) {
        videos[videoIdx].videoEl.remove();
        videos.splice(videoIdx, 1);
        this.setState({ videoList: videos });
      }
      this.removeStaleVideo();
    });
  }

  copyRoomLink() {
    copy(window.location.href);
  }

  removeStaleVideo() {
    const videos = this.state.videoList;
    const vidsToRemove = [];
    videos.forEach(({ videoEl }, idx) => {
      if (!videoEl?.srcObject) {
        vidsToRemove.push(idx);
        videoEl.remove();
      }
    });
    vidsToRemove.forEach((idx) => videos.splice(idx, 1));
    this.setState({ videoList: videos });
  }

  removeVideo(peerId) {
    const list = [...this.state.videoList];
    const idx = list.findIndex((v) => v.peerId === peerId);
    if (idx > -1) {
      list[idx].videoEl.close();
      this.setState({ videoList: list });
    }
  }

  removePeer(peerId) {
    const list = [...this.state.peers];
    const idx = list.findIndex((v) => v.id === peerId);

    if (idx > -1) {
      list[idx].call?.close();
      this.setState({ peers: list });
    }
  }

  joinCall() {
    this.destroyAllConnections();
    this.joinRoom(false, true);
  }

  rejoinRoom() {
    this.setState({ retry: false });
    this.destroyAllConnections();
    this.joinRoom(this.state.viewer);
  }

  destroyAllConnections() {
    this.state.peers.forEach((v) => v?.call?.close());
    this.state.videoList.forEach((v) => v?.videoEl?.remove());
    this.setState({ videoList: [], peers: [] });
  }

  addVideoStream(video, stream, peerId) {
    video.srcObject = stream;

    video.addEventListener("loadedmetadata", () => {
      video.play().catch(() => this.setState({ retry: true }));
    });
    const videoList = this.state.videoList;
    videoList.push({ peerId, videoEl: video });
    this.setState({ videoList });

    let checkExist = setInterval(function () {
      const vidContainer = document.getElementById(peerId);
      if (vidContainer) {
        vidContainer.append(video);
        clearInterval(checkExist);
      }
    }, 100);
  }

  setupCalls({
    peerId = null,
    peer,
    stream = null,
    isAnswering = false,
    callCtx = null,
    viewer = false,
  }) {
    // Handles call along with returning call object
    const call = isAnswering ? callCtx : peer.call(peerId, stream);
    const video = document.createElement("video");
    const idToUse = isAnswering ? call.peer : peerId;

    if (isAnswering) {
      call.answer(viewer ? undefined : stream);
    }

    call.on("stream", (userVideoStream) => {
      const peers = this.state.peers;
      const peerIdx = peers.findIndex((v) => v.id === idToUse);
      const newPeerObj = {
        call,
        id: idToUse,
        stream: userVideoStream,
        connectionTime: new Date(),
      };

      if (peerIdx > -1) {
        peers.splice(peerIdx, 1, { ...peers[peerIdx], ...newPeerObj });
        this.setState({ peers });
      } else {
        peers.push(newPeerObj);
      }

      this.setState({ peers });

      if (!this.state.videoList.find((v) => v.peerId === idToUse)) {
        this.addVideoStream(video, userVideoStream, idToUse);
      }
    });
    call.on("close", () => {
      console.log("Peer left: ", idToUse);
      const peers = this.state.peers.filter((v) => v.id !== idToUse);
      this.setState({ peers });
      video.remove();
      this.removeStaleVideo();
    });
  }

  setupDevicesAndStreams(peerId, peer, viewer = false) {
    appStore.socket.on("room-presence", (room) => {
      this.setState({
        roomName: room.name,
        roomDescription: room.description,
        roomImage: room.image,
      });
      room.users.forEach(({ userName, peerId }) => {
        const list = this.state.peers;
        const peerIdx = list.findIndex((v) => v.id === peerId);

        if (peerIdx > -1) {
          list.splice(peerIdx, 1, { ...list[peerIdx], userName });
        } else {
          list.push({ id: peerId, userName });
        }
        this.setState({ peers: list });
      });
    });

    if (viewer) {
      peer.on("call", (call) => {
        const list = this.state.peers;
        const newPeerObj = {
          call,
          id: call.peer,
          connectionTime: new Date(),
        };

        const peerIdx = list.findIndex((v) => v.id === call.peer);

        if (peerIdx > -1) {
          list.splice(peerIdx, 1, { ...list[peerIdx], ...newPeerObj });
        } else {
          list.push(newPeerObj);
        }
        this.setState({ peers: list });

        this.setupCalls({ peer, viewer, isAnswering: true, callCtx: call });
      });
      appStore.socket.on("user-connected", (connectedUserPeerId) => {
        if (
          connectedUserPeerId !== peerId &&
          !this.state.peers[connectedUserPeerId]
        ) {
          this.setupCalls({ peer, viewer, peerId: connectedUserPeerId });
        }
      });
      appStore.socket.on("viewer-joined-call", ({ oldPeerId, newPeerId }) => {
        if (newPeerId !== peerId) {
          this.removePeer(oldPeerId);
          this.setupCalls({ peer, viewer, peerId: newPeerId, callCtx: peer });
        }
      });
      return;
    }

    const myVideo = document.createElement("video");
    myVideo.muted = true;
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.addVideoStream(myVideo, stream, peerId);
        const peers = this.state.peers;
        const peerIdx = peers.findIndex((v) => v.id === peerId);
        const newPeerObj = {
          call: peer,
          id: peerId,
          stream,
          connectionTime: new Date(),
        };

        if (peerIdx > -1) {
          peers.splice(peerIdx, 1, { ...peers[peerIdx], ...newPeerObj });
          this.setState({ peers });
        } else {
          peers.push(newPeerObj);
        }

        this.setState({ peers });

        peer.on("call", (call) => {
          const peers = this.state.peers;
          const peerIdx = peers.findIndex((v) => v.id === call.peer);
          const newPeerObj = {
            call: peer,
            id: call.peer,
            stream,
            connectionTime: new Date(),
          };

          if (peerIdx > -1) {
            peers.splice(peerIdx, 1, { ...peers[peerIdx], ...newPeerObj });
            this.setState({ peers });
          } else {
            peers.push(newPeerObj);
          }

          this.setState({ peers });

          this.setupCalls({ peer, stream, isAnswering: true, callCtx: call });
        });

        appStore.socket.on("user-connected", (connectedUserPeerId) => {
          if (
            connectedUserPeerId !== peerId &&
            !this.state.peers[connectedUserPeerId]
          ) {
            this.setupCalls({ peer, peerId: connectedUserPeerId, stream });
          }
        });

        appStore.socket.on("viewer-joined-call", ({ oldPeerId, newPeerId }) => {
          if (newPeerId !== peerId) {
            this.removePeer(oldPeerId);
            this.removeVideo(oldPeerId);
            this.setupCalls({ peer, peerId: newPeerId, stream });
          }
        });
      });
  }

  createRoom() {
    const myPeer = new Peer();

    myPeer.on("open", (peerId) => {
      this.setState({ myPeerId: peerId });
      console.log("Host peer: ", peerId);
      const config = {
        ...appStore.roomConfig,
        userToken: appStore.userToken,
        userName: appStore.name,
        peerId,
        action: "create",
      };
      appStore.socket.emit("join-room", config);
      appStore.clearRoomConfig();
      this.setupDevicesAndStreams(peerId, myPeer);
    });
  }
  joinRoom(viewer = false, viewerToCaller = false) {
    const myPeer = new Peer();

    myPeer.on("open", (peerId) => {
      console.log("Participant peer: ", peerId);
      if (viewerToCaller) {
        const oldPeerId = this.state.myPeerId;
        const roomId = this.state.roomId;
        appStore.socket.emit("viewer-to-caller", {
          oldPeerId,
          newPeerId: peerId,
          roomId,
          userToken: appStore.userToken,
        });
      } else {
        appStore.socket.emit("join-room", {
          id: this.state.roomId,
          peerId,
          userName: appStore.name,
          userToken: appStore.userToken,
          action: "join",
        });
      }
      this.setState({ myPeerId: peerId });

      this.setupDevicesAndStreams(peerId, myPeer, viewer);
    });
  }
  render() {
    return (
      <div className="main-room-container">
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
              <span className="header-attr-style">Room ID:</span>{" "}
              {this.state.roomId}
              <span
                className="material-icons copy-style"
                onClick={() => this.copyRoomLink()}
              >
                content_copy
              </span>
            </h4>
          </div>
          <Figure src={this.state.roomImage} alt="Room Image"></Figure>
        </div>
        <div className="room-content">
          <div className="video-container">
            <div id="video-grid">
              {this.state.videoList.map((v, idx) => (
                <div className="video-item" key={idx}>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore */}
                  <FrameCorners
                    cornerWidth={1}
                    cornerLength={20}
                    showContentLines
                    contentLineWidth={1}
                    hover
                    palette="secondary"
                  >
                    <div className="video-wrapper" id={v.peerId}>
                      <div className="video-overlay">
                        <Text
                          as="h4"
                          animator={{
                            manager: "stagger",
                            duration: { enter: 200, exit: 200 },
                          }}
                        >
                          {
                            this.state.peers.find(
                              (peer) => peer.id === v.peerId
                            )?.userName
                          }
                        </Text>
                      </div>
                    </div>
                  </FrameCorners>
                </div>
              ))}
            </div>
            <div className="room-controls">
              {this.state.viewer && !this.state.retry && (
                <Button onClick={() => this.joinCall()}>
                  <Text>Join Room</Text>
                </Button>
              )}
              {this.state.retry && (
                <Button onClick={() => this.rejoinRoom()}>
                  <Text>Rejoin Room</Text>
                </Button>
              )}
            </div>
          </div>
          <Chat roomId={this.state.roomId} />
        </div>
      </div>
    );
  }
}

export default view(Room);
