const jwt = require("jwt-simple");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  // cors: {
  //   origin: "http://localhost:1234",
  //   methods: ["GET", "POST"],
  // },
});
const { v4: uuidV4 } = require("uuid");

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile(dist + "/index.html");
});

app.get("/room", (req, res) => {
  res.sendFile(dist + "/index.html");
});

const state = {
  users: [],
  rooms: [],
  sockets: [],
};

const webPresence = (socket = {}) => {
  return {
    userId: socket.id,
    rooms: state.rooms
      .filter((v) => !v.private)
      .map((room) => ({ ...room, users: room.users.map((v) => v.peerId) })),
  };
};

const roomPresence = (roomId, socket) => {
  const room = state.rooms.find((v) => v.id === roomId);

  if (!room) {
    return socket.emit("error", "Room does not exist!");
  }

  socket.emit("room-presence", {
    ...room,
    users: room.users.map(({ peerId, userName }) => ({ peerId, userName })),
  });

  socket.to(roomId).emit("room-presence", {
    ...room,
    users: room.users.map(({ peerId, userName }) => ({ peerId, userName })),
  });
};

const updateSockets = (socket, remove) => {
  socketIdx = state.sockets.findIndex((v) => v.id === socket.id);

  if (remove) return state.sockets.splice(socketIdx, 1);

  socketIdx > -1
    ? state.sockets.splice(socketIdx, 1, socket)
    : state.sockets.push(socket);
};

const updateUsers = ({ userToken, socketId, uniquePresence, remove }) => {
  const newUserObj = {
    userToken,
    socketId,
    uniquePresence,
    lastLogin: new Date(),
  };

  const userIdx = state.users.findIndex((v) => v.userToken === userToken);

  if (remove) {
    if (!userToken) {
      const socketIdx = state.users.findIndex((v) => v.socketId === socketId);
      return state.users.splice(socketIdx, 1);
    }
    return state.users.splice(userIdx, 1);
  }

  userIdx > -1
    ? state.users.splice(userIdx, 1, { ...state.users[userIdx], ...newUserObj })
    : state.users.push(newUserObj);
};

const joinHandler = ({
  id,
  action,
  socket,
  peerId,
  userToken,
  userName,
  name,
  description,
  image,
  io,
}) => {
  if (action === "create") {
    if (state.rooms.find((v) => v.id === id)) {
      return socket.emit("error", "Room already exists!");
    }
    const user = state.users.find((v) => v.userToken === userToken);
    state.rooms.push({
      id,
      users: [{ ...user, userName, peerId }],
      name,
      image,
      description,
    });
    io.emit("web-presence", webPresence());
  } else if (action === "join") {
    const roomIdx = state.rooms.findIndex((v) => v.id === id);
    if (roomIdx === -1) {
      return socket.emit("error", "Room does not exist!");
    }
    const room = state.rooms[roomIdx];
    const user = state.users.find((v) => v.userToken === userToken);
    const roomUsers = [...room.users];
    roomUsers.push({ ...user, userName, peerId });
    state.rooms.splice(roomIdx, 1, { ...room, users: roomUsers });
  }
  console.log(`${socket.id} connected to room:`, id);
};

const removeUserFromRoom = (id, userToken, io) => {
  const roomIdx = state.rooms.findIndex((v) => v.id === id);

  if (roomIdx === -1) {
    console.log("Cannot remove user from room that does not exist!");
    return;
  }

  const room = state.rooms[roomIdx];
  const userIdx = room.users.findIndex((v) => v.userToken === userToken);

  const users = room.users.filter((_, idx) => idx !== userIdx);

  if (users.length) {
    state.rooms.splice(roomIdx, 1, {
      ...room,
      users,
    });
  } else {
    state.rooms.splice(roomIdx, 1);
    console.log("Room has been deleted due to no users");
  }
  io.emit("web-presence", webPresence());
};

io.on("connection", (socket) => {
  updateSockets(socket);
  console.log("New connection: ", socket.id);

  socket.emit("web-presence", webPresence(socket));
  socket.on("join-room", (payload) => {
    const room = state.rooms.find((v) => v.id === payload.id);

    roomPresence(payload.id, socket);

    if (room?.users.find((v) => v.socketId === socket.id)) {
      console.log("User has already joined the room.");
      return;
    }

    joinHandler({ ...payload, socket, io });
    socket.join(payload.id);
    socket.to(payload.id).emit("user-connected", payload.peerId);
    roomPresence(payload.id, socket);
    // setTimeout(() => roomPresence(payload.id, socket), 5000);

    socket.on("disconnect", () => {
      socket.to(payload.id).emit("user-disconnected", payload.peerId);
      removeUserFromRoom(payload.id, payload.userToken, io);
      roomPresence(payload.id, socket);
      console.log(`User: ${socket.id} left room: ${payload.id}`);
    });
  });

  socket.on(
    "viewer-to-caller",
    ({ userToken, roomId, oldPeerId, newPeerId }) => {
      socket.to(roomId).emit("viewer-joined-call", { oldPeerId, newPeerId });
    }
  );

  socket.on("set-user-presence", ({ userToken, uniquePresence }) => {
    let token = userToken;

    if ((!userToken || userToken == "undefined") && uniquePresence) {
      token = jwt.encode({ creationDate: new Date() }, uniquePresence);
      socket.emit("updated-user-presence", { userToken: token });
      console.log(`User: ${socket.id} has logged in for the first time`);
    } else {
      console.log(`User: ${socket.id} has relogged in`);
    }
    updateUsers({ userToken: token, socketId: socket.id, uniquePresence });
    console.log("Total Users Online: ", state.users.length);
  });

  socket.on("disconnect", () => {
    updateUsers({ socketId: socket.id, remove: true });
    updateSockets(socket.id, true);

    console.log(`User: ${socket.id} disconnected`);
    console.log("Total Users Online: ", state.users.length);
  });
});

server.listen(3000);
