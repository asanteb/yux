const jwt = require("jwt-simple");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:1234",
    methods: ["GET", "POST"],
  },
});
const { v4: uuidV4 } = require("uuid");

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile(dist + "/index.html");
});

const state = {
  users: [],
  rooms: [],
  sockets: [],
};

const webPresence = (socket) => {
  return {
    userId: socket.id,
    rooms: state.rooms.filter((v) => !v.private),
  };
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

io.on("connection", (socket) => {
  updateSockets(socket);
  console.log("New connection: ", socket.id);

  socket.emit("web-presence", webPresence(socket));
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    console.log(`${userId} connected to room:`, roomId);

    socket.on("disconnect", () => {
      console.log(`User: ${socket.id} left room: ${roomId}`);
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });

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
