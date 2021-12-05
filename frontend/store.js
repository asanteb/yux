import { store } from "@risingstack/react-easy-state";
import { io } from "socket.io-client";
import { v4 as uuid } from "uuid";
import ls from "local-storage";
import ShortUniqueId from "short-unique-id";

const shortUid = new ShortUniqueId({ length: 10 });

const URL =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "/";

const appStore = store({
  id: "",
  name: "",
  avatar: "",
  rooms: [],
  newUser: false,
  userToken: "",
  uniquePresence: "",
  roomConfig: {},
  socket: io(URL),

  initProfile() {
    let uniquePresence = ls.get("uniquePresence");
    let userToken = ls.get("userToken");

    if (!userToken || !uniquePresence) {
      this.newUser = true;
    }

    if (userToken) {
      this.userToken = userToken;
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

  createRoom({ name, description, image }) {
    this.roomConfig.name = name;
    this.roomConfig.description = description;
    this.roomConfig.image = image;
    this.roomConfig.id = shortUid();
  },

  clearRoomConfig() {
    this.roomConfig = {};
  },
});

window.appStore = appStore;

export default appStore;
