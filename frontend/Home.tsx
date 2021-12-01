import { useState, useEffect } from "react";
import Peer from "peerjs";
import { io } from "socket.io-client";
import { v4 as uuid } from "uuid";

const App = () => {
  const [roomId, setRoom] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  let videoGrid;

  useEffect(() => {
    videoGrid = document.getElementById("video-grid");
  });

  const socket = io("http://localhost:3000");

  const peers = {};

  socket.on("user-disconnected", (userId) => {
    if (peers[userId]) peers[userId].close();
  });

  function connectToNewUser(userId, stream, myPeer) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
      video.remove();
    });

    peers[userId] = call;
  }

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoGrid.append(video);
  }

  function createRoom() {
    const roomIdToJoin = joinRoomId || roomId || uuid();
    setRoom(roomIdToJoin);
    const myVideo = document.createElement("video");
    const myPeer = new Peer();

    myPeer.on("open", (id) => {
      socket.emit("join-room", roomIdToJoin, id);
    });

    myVideo.muted = true;
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        addVideoStream(myVideo, stream);

        myPeer.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
          });
        });

        socket.on("user-connected", (userId) => {
          connectToNewUser(userId, stream, myPeer);
        });
      });
  }
  function joinRoom() {
    createRoom();
  }
  return (
    <div>
      <h1>Hello There!</h1>
      <div>
        <h4>RoomID: {roomId}</h4>
        <button onClick={createRoom}>Create Room</button>
        <div style={{ margin: "8px 0" }}>
          <input
            type="text"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      </div>
      <div id="video-grid"></div>
    </div>
  );
};

export default App;
