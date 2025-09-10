          //day 10 & 11 working fine
          
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// rooms map: roomId -> [socketIds]
const rooms = {};

io.on("connection", (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  socket.on("join", (roomId = "global-room") => {
    socket.join(roomId);
    console.log(`📢 Client ${socket.id} joined room: ${roomId}`);

    if (!rooms[roomId]) rooms[roomId] = [];
    // avoid duplicates
    if (!rooms[roomId].includes(socket.id)) rooms[roomId].push(socket.id);

    // notify others
    socket.to(roomId).emit("user-joined", { id: socket.id });
  });

  socket.on("offer", (data) => {
    // { room, sdp }
    if (!data?.room) return;
    console.log(`📨 Offer from ${socket.id} for room: ${data.room}`);
    socket.to(data.room).emit("offer", { sdp: data.sdp, from: socket.id });
  });

  socket.on("answer", (data) => {
    // { room, sdp }
    if (!data?.room) return;
    console.log(`📨 Answer from ${socket.id} for room: ${data.room}`);
    socket.to(data.room).emit("answer", { sdp: data.sdp, from: socket.id });
    
  });

  socket.on("ice-candidate", (data) => {
    // { room, candidate }
    if (!data?.room) return;
    // forward candidate to others in room
    socket.to(data.room).emit("ice-candidate", { candidate: data.candidate, from: socket.id });
  });

  socket.on("leave", (roomId) => {
    if (!roomId) return;
    socket.leave(roomId);
    console.log(`👋 Client ${socket.id} left room: ${roomId}`);
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      socket.to(roomId).emit("user-left", { id: socket.id });
      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      socket.to(roomId).emit("user-left", { id: socket.id });
      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`);
});


