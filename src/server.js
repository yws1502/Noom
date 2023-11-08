import http from "http";
import { Server } from "socket.io";

import { instrument } from "@socket.io/admin-ui";

import express from "express";

const app = express();

const port = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

// http server
const httpServer = http.createServer(app);

// webSocket server
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

/*
socket io admin ui

link: https://admin.socket.io/#/
*/
instrument(wsServer, {
  auth: false,
});

const handleListen = () => console.log(`Listening on http://localhost:${port}`);

httpServer.listen(port, handleListen);
