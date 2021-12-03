const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:1234",
    methods: ["GET", "POST"],
  },
});
// const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile(dist + "/index.html");
});

// app.get('/:room', (req, res) => {
//   res.render('room', { roomId: req.params.room })
// })

io.on("connection", (socket) => {
  console.log("New connection");
  socket.on("join-room", (roomId, userId) => {
    const ss = io;
    socket.join(roomId);
    console.log(`${userId} connected to room:`, roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      console.log("User disconnected");
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(3000);