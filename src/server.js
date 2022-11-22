const users = {};
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
//--------------------------------------------------------------------

app.get("/", (req, res) => {
  res.sendFile(__dirname.slice(0, -3) + "index.html");
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
const MyCoolAgent = require("./MyCoolAgent");
const dotenv = require("dotenv");
dotenv.config();

const conf = {
  accountId: process.env.LP_ACCOUNT,
  username: process.env.LP_USER,
  password: process.env.LP_PASS,
};
if (process.env.LP_CSDS) {
  conf.csdsDomain = process.env.LP_CSDS;
}

const echoAgent = new MyCoolAgent(conf);

//--------------------------------------------------------------------

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});
