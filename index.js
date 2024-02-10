const express = require("express");
const dotenv = require("dotenv");
const app = express();
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const ACTIONS = require("./client/src/Action.js");

dotenv.config({ path: "./config.env" });

require("./Mongodb")();

const User = require("./models/User");

app.use(express.static("client/build"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("socket connected");
  socket.on(ACTIONS.JOIN, async ({ username, roomId }) => {
    try {
      socket.join(roomId);
      const newuser = await User.create({
        username,
        roomId,
        socketid: socket.id,
      });
      const allclient = await User.find({ roomId });
      console.log(allclient);
      io.to(roomId).emit(ACTIONS.JOINED, {
        username: newuser.username,
        socketid: newuser.socketid,
        allclient,
      });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on(ACTIONS.CODE_CHANGE, ({ username, code, roomId }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { username, code });
  });
  socket.on(ACTIONS.SYNC_CODE, ({ code, socketid }) => {
    io.to(socketid).emit(ACTIONS.SYNC_CODE, { code });
  });

  socket.on("disconnecting", async () => {
    const FindDuser = await User.findOne({ socketid: socket.id });
    await User.deleteOne({ socketid: socket.id });
    const allclient = await User.find({ roomId: FindDuser.roomId });
    socket.in(FindDuser.roomId).emit(ACTIONS.DISCONNECTED, {
      username: FindDuser.username,
      allclient,
    });

    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));


// minor change
