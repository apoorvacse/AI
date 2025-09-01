// server/index.js
// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";

// const app = express();
// app.use(cors());

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*", // allow client (React) to connect
//     methods: ["GET", "POST"],
//   },
// });

// // Socket.IO signaling
// io.on("connection", (socket) => {
//   console.log("New client connected:", socket.id);

//   socket.on("join", (room) => {
//     socket.join(room);
//     console.log(`${socket.id} joined room ${room}`);
//   });

//   socket.on("offer", (data) => {
//     socket.to(data.room).emit("offer", data);
//   });

//   socket.on("answer", (data) => {
//     socket.to(data.room).emit("answer", data);
//   });

//   socket.on("candidate", (data) => {
//     socket.to(data.room).emit("candidate", data);
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected:", socket.id);
//   });
// });

// const PORT = 3001;
// server.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });

// server/index.js

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`${socket.id} joined room ${room}`);
    socket.to(room).emit("new-peer", socket.id);
  });

  socket.on("offer", ({ room, sdp }) => {
    socket.to(room).emit("offer", { sdp, from: socket.id });
  });

  socket.on("answer", ({ room, sdp }) => {
    socket.to(room).emit("answer", { sdp, from: socket.id });
  });

  socket.on("ice-candidate", ({ room, candidate }) => {
    socket.to(room).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("✅ Signaling server running at http://localhost:3001");
});