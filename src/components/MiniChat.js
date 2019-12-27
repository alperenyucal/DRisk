import React, { useState, useEffect, useRef } from "react";
import { Button, InputGroup } from "@blueprintjs/core";

export default ({ socket, room, style, users }) => {

  let [messages, setMessages] = useState([]);
  const form = useRef();

  useEffect(() => {
    try {
      socket.on('message', ({ message, socketId, log }) => {
        setMessages(messages => [...messages, { message: message, socketId: socketId, log: log }])
      });
    }
    catch (error) {
      console.log(error);
    }

  }, []);

  return (
    <div style={{
      ...style,
      display: "flex",
      flexDirection: "column",
      background: "black",
      color: "white",
      border: "3px solid black"
    }}>
      <div style={{
        flex: "6",
        overflow: "auto",
        display: "flex",
        flexDirection: "column-reverse",
        padding: "10px"
      }}>
        {messages.slice(0).reverse().slice(0, 10).map((msg, i) => {
          let user = users.find(usr => usr.socketId == msg.socketId)
          return msg.log ? (
            <div key={i} style={{ color: "gray" }}>
              {msg.message}
            </div>
          ) : <div key={i}>
              <span style={{ color: user.color }}>{user.username}: </span> {msg.message}
            </div>
        })}
      </div>
      <form ref={form} style={{ flex: "1" }} onSubmit={e => {
        e.preventDefault();
        let input = e.target[0].value;
        if (input != null && input != "") {
          form.current.reset();
          socket.emit("message", { message: input, room: room.name });
        }
      }}>
        <div style={{ display: "flex", width: "100%" }}>
          <div style={{ flex: "auto", marginRight: "2px" }}><InputGroup /></div>
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  );
}