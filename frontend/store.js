import { store } from "@risingstack/react-easy-state";
import { io } from "socket.io-client";
import { v4 as uuid } from "uuid";
import ls from "local-storage";

const URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://yux.watch";

export default store({
  id: "",
  name: "",
  avatar: "",
  rooms: [],
  newUser: false,
  userToken: "",
  uniquePresence: "",
  socket: io(URL),
  // peer: new Peer(),

  initProfile() {
    let uniquePresence = ls.get("uniquePresence");
    let userToken = ls.get("userToken");

    if (!userToken || !uniquePresence) {
      this.newUser = true;
    }

    if (!userToken) {
      uniquePresence = uuid();
      ls.set("uniquePresence", uniquePresence);
    }

    this.name = ls.get("name") || "";
    this.avatar = ls.get("avatar") || "";

    this.socket.on("connect", () => {
      console.log("Connected to WebServer");
      this.socket.emit("set-user-presence", { userToken, uniquePresence });
    });
    this.socket.on("updated-user-presence", ({ userToken }) => {
      ls.set("userToken", userToken);
      this.userToken = userToken;
      console.log("My Token: ", userToken);
    });
    this.socket.on("web-presence", ({ userId, rooms = [] }) => {
      this.id = userId;
      this.rooms = rooms;
    });
  },

  updateProfile({ avatar = "", name = "" }) {
    this.name = name;
    this.avatar = avatar;
    ls.set("name", name);
    ls.set("avatar", avatar);
    this.newUser = false;
  },
});
