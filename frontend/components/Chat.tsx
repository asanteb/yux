import { useState, useEffect } from "react";
import { formatRelative } from "date-fns";
import { FrameHexagon } from "@arwes/core";
import { view } from "@risingstack/react-easy-state";
import appStore from "../store";

const Chat = ({ roomId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    const msg = {
      roomId,
      message,
      userName: appStore.name,
      avatar: appStore.avatar,
      date: String(new Date()),
    };

    appStore.socket.emit("send-room-message", msg);
    const newMessages = [...messages];
    newMessages.push({ ...msg, userName: "You" });
    setMessages(newMessages);
    setMessage("");
  };

  useEffect(() => {
    appStore.socket.on("room-message", (msg) => {
      const newMessages = [...messages];
      newMessages.push(msg);
      setMessages(newMessages);
    });

    const el = document.getElementById("message-holder");
    if (el) {
      const height = el.scrollHeight;
      el.scrollTo(0, height);
    }
  });

  return (
    <div className="chat-container">
      <div id="message-holder" className="message-holder">
        {messages.map((msg, idx) => (
          <div key={idx} className="message-container">
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <FrameHexagon inverted hover>
              <div className="message-header vertical-center">
                <img src={msg.avatar} />
                <span>{msg.userName}:</span>
              </div>
              <div className="message-message">
                <p>{msg.message}</p>
                <small>{formatRelative(new Date(msg.date), new Date())}</small>
              </div>
            </FrameHexagon>
          </div>
        ))}
      </div>
      <div className="chat-box">
        <input
          className="chat-box-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <div className="chat-box-send vertical-center">
          <span className="material-icons" onClick={() => sendMessage()}>
            send
          </span>
        </div>
      </div>
    </div>
  );
};

export default view(Chat);
