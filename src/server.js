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
var dialogId;

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("outgoing message", ({ msg, dialogId }) => {
    echoAgent.publishEvent({
      dialogId: dialogId,
      event: {
        type: "ContentEvent",
        contentType: "text/plain",
        message: `${msg}`,
      },
    });
    io.emit("incoming message", { msg: msg, dialogId: dialogId });
  });
  /* echoAgent.on(echoAgent.CONTENT_NOTIFICATION, (contentEvent) => {
    if (
      !contentEvent.message.startsWith("#close") &&
      !contentEvent.message.startsWith("#test")
    ) {
      io;
    }
  }); */
});

echoAgent.on(echoAgent.CONTENT_NOTIFICATION, (contentEvent) => {
  if (contentEvent.message.startsWith("#close")) {
    echoAgent.updateConversationField({
      conversationId: contentEvent.dialogId,
      conversationField: [
        {
          field: "ConversationStateField",
          conversationState: "CLOSE",
        },
      ],
    });
  } else if (contentEvent.message.startsWith("#test")) {
    console.log("closing WS in 5s");

    setTimeout(() => {
      console.log("closing WS");
      echoAgent.transport.ws.close();
    }, 5000);
  } else {
    io.emit("incoming message", {
      msg: contentEvent.message,
      dialogId: contentEvent.dialogId,
    });
    /* echoAgent.publishEvent({
      dialogId: contentEvent.dialogId,
      event: {
        type: "ContentEvent",
        contentType: "text/plain",
        message: `echo : ${contentEvent.message}`,
      },
    }); */
  }
});
