/**
 *  Importing the necesssary modules
 */
const express = require("express");
const app = express();
const socket = require("socket.io");

/**
 *  Create a server with port number 3000
 */
const server = app.listen(3000, () => {
  console.log("Server listening to 3000...");
});

/**
 * Render the html file using the middleware
 */
app.use(express.static("./"));

/**
 *  Socket initialization
 */
let io = socket(server);
let usersList = {};

/**
 * When the socket connection established the Connection listener is emitted.
 */
io.on("connection", (socket) => {
  // When a new user joined the chat ,this will broadcast the username to all others chat as user joined.
  socket.on("newUser", (userName) => {
    usersList[socket.id] = userName;
    socket.broadcast.emit("join", usersList[socket.id]);
  });

  // When a user disconnect the chat, this will broadcast the  username to all others chat as user left.
  socket.on("disconnect", () => {
    socket.broadcast.emit("left", usersList[socket.id]);
    delete usersList[socket.id];
  });

  // When a user send a message, this will broadcast to all users who are connected.
  socket.on("chat", (data) => {
    socket.broadcast.emit("chat", data);
  });

  // When a user is typing , this will broadcast user name to other user.
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  // To get the current online users list.
  socket.on("getUsers", () => {
    socket.emit("sendUsers", usersList);
  });
});
