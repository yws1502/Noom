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

wsServer.on("connection", (socket) => {
  // event is like enter_room, anymore
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);

    done();

    socket.to(roomName).emit("welcome");
  });

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", msg);

    done();
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye"));
  });
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
