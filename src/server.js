import http from "http";
import SocketIO from "socket.io";

import express from "express";

const app = express();

const port = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:${port}`);

// http server
const httpServer = http.createServer(app);

// webSocket server
const wsServer = SocketIO(httpServer);

function publicRooms() {
  const { sockets } = wsServer;

  const { sids, rooms } = sockets.adapter;

  const publicRooms = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) publicRooms.push(key);
  });
  return publicRooms;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";

  // event is like enter_room, anymore
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);

    done();

    socket.to(roomName).emit("welcome", socket.nickname);

    wsServer.sockets.emit("room_change", publicRooms());
  });

  // disconnecting event는 socket이 방을 떠나기 바로 직전에 발생 함.
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);

    done();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

/*
import WebSocket from "ws";

const wss = new WebSocket.Server({ server });

function onSocketClose() {
  console.log("Disconnected from the Browser ❌");
}

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  console.log("Connected to Browser ✅");

  socket["nickname"] = "Anon";

  socket.on("close", onSocketClose);

  socket.on("message", (msg) => {
    const message = JSON.parse(msg);

    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
        break;
      case "nickname":
        socket["nickname"] = message.payload;
        break;
    }
  });
});
*/

httpServer.listen(port, handleListen);
