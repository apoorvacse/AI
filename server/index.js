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

// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("New client connected:", socket.id);

//   socket.on("join", (room) => {
//     socket.join(room);
//     console.log(`${socket.id} joined room ${room}`);
//     socket.to(room).emit("new-peer", socket.id);
//   });

//   socket.on("offer", ({ room, sdp }) => {
//     socket.to(room).emit("offer", { sdp, from: socket.id });
//   });

//   socket.on("answer", ({ room, sdp }) => {
//     socket.to(room).emit("answer", { sdp, from: socket.id });
//   });

//   socket.on("ice-candidate", ({ room, candidate }) => {
//     socket.to(room).emit("ice-candidate", { candidate, from: socket.id });
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected:", socket.id);
//   });
// });

// server.listen(3001, () => {
//   console.log("✅ Signaling server running at http://localhost:3001");
// });

// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("New client connected:", socket.id);

//   socket.on("join", (room) => {
//     socket.join(room);
//     console.log(`${socket.id} joined room ${room}`);
//     socket.to(room).emit("new-peer", socket.id);
//   });

//   socket.on("offer", ({ room, sdp }) => {
//     socket.to(room).emit("offer", { sdp, from: socket.id });
//   });

//   socket.on("answer", ({ room, sdp }) => {
//     socket.to(room).emit("answer", { sdp, from: socket.id });
//   });

//   socket.on("ice-candidate", ({ room, candidate }) => {
//     socket.to(room).emit("ice-candidate", { candidate, from: socket.id });
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected:", socket.id);
//   });
// });

// // ✅ Use Render's assigned port, fallback to 3001 locally
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`✅ Signaling server running at http://localhost:${PORT}`);
// });

// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // allow all origins (for testing)
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("✅ New client connected:", socket.id);

//   socket.on("join", (room) => {
//     socket.join(room);
//     console.log(`📢 Client ${socket.id} joined room: ${room}`);
//   });

//   socket.on("offer", ({ room, offer }) => {
//     console.log(`📨 Offer received from ${socket.id} for room: ${room}`);
//     socket.to(room).emit("offer", offer);
//   });

//   socket.on("answer", ({ room, answer }) => {
//     console.log(`📨 Answer received from ${socket.id} for room: ${room}`);
//     socket.to(room).emit("answer", answer);
//   });

//   socket.on("ice-candidate", ({ room, candidate }) => {
//     console.log(`📨 ICE Candidate from ${socket.id} for room: ${room}`);
//     socket.to(room).emit("ice-candidate", candidate);
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected:", socket.id);
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Signaling server running on port ${PORT}`);
// });

// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // allow all origins (Netlify frontend will connect here)
//     methods: ["GET", "POST"]
//   }
// });

// // Track users in rooms
// const rooms = {};

// io.on("connection", (socket) => {
//   console.log(`✅ New client connected: ${socket.id}`);

//   // When user joins a room
//   socket.on("join", (roomId) => {
//     socket.join(roomId);
//     console.log(`📢 Client ${socket.id} joined room: ${roomId}`);

//     if (!rooms[roomId]) {
//       rooms[roomId] = [];
//     }
//     rooms[roomId].push(socket.id);

//     // Notify others in the room
//     socket.to(roomId).emit("user-joined", socket.id);
//   });

//   // When sending an offer
//   socket.on("offer", (data) => {
//     console.log(`📨 Offer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("offer", {
//       sdp: data.sdp,
//       sender: socket.id
//     });
//   });

//   // When sending an answer
//   socket.on("answer", (data) => {
//     console.log(`📨 Answer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("answer", {
//       sdp: data.sdp,
//       sender: socket.id
//     });
//   });

//   // When sending ICE candidates
//   socket.on("ice-candidate", (data) => {
//     console.log(`📡 ICE Candidate from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("ice-candidate", {
//       candidate: data.candidate,
//       sender: socket.id
//     });
//   });

//   // When a client disconnects
//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     for (const roomId in rooms) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       if (rooms[roomId].length === 0) {
//         delete rooms[roomId];
//       }
//     }
//   });
// });

// // ✅ Use Render’s dynamic PORT
// const PORT = process.env.PORT || 10000;
// server.listen(PORT, () => {
//   console.log(`🚀 Signaling server running on port ${PORT}`);
// });

// import express from "express";
// import http from "http";
// import { Server } from "socket.io";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// // Track users in rooms
// const rooms = {};

// io.on("connection", (socket) => {
//   console.log(`✅ New client connected: ${socket.id}`);

//   socket.on("join", (roomId) => {
//     socket.join(roomId);
//     console.log(`📢 Client ${socket.id} joined room: ${roomId}`);

//     if (!rooms[roomId]) {
//       rooms[roomId] = [];
//     }
//     rooms[roomId].push(socket.id);

// //     socket.to(roomId).emit("user-joined", socket.id);
// //   });

//   socket.on("offer", (data) => {
//     console.log(`📨 Offer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("offer", {
//       sdp: data.sdp,
//       sender: socket.id
//     });
//   });

//   socket.on("answer", (data) => {
//     console.log(`📨 Answer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("answer", {
//       sdp: data.sdp,
//       sender: socket.id
//     });
//   });

//   socket.on("ice-candidate", (data) => {
//     console.log(`📡 ICE Candidate from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("ice-candidate", {
//       candidate: data.candidate,
//       sender: socket.id
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     for (const roomId in rooms) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       if (rooms[roomId].length === 0) {
//         delete rooms[roomId];
//       }
//     }
//   });
// });

// const PORT = process.env.PORT || 10000;
// server.listen(PORT, () => {
//   console.log(`🚀 Signaling server running on port ${PORT}`);
// });

// import express from "express";
// import http from "http";
// import { Server } from "socket.io";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// // Track users in rooms
// const rooms = {};

// io.on("connection", (socket) => {
//   console.log(`✅ New client connected: ${socket.id}`);

//   socket.on("join", (roomId) => {
//     socket.join(roomId);
//     console.log(`📢 Client ${socket.id} joined room: ${roomId}`);

//     if (!rooms[roomId]) {
//       rooms[roomId] = [];
//     }
//     rooms[roomId].push(socket.id);

//     // notify others in room
//     socket.to(roomId).emit("user-joined", socket.id);
//   });

//   socket.on("offer", (data) => {
//     console.log(`📨 Offer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("offer", {
//       sdp: data.offer,
//       sender: socket.id,
//     });
//   });

//   socket.on("answer", (data) => {
//     console.log(`📨 Answer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("answer", {
//       sdp: data.answer,
//       sender: socket.id,
//     });
//   });

//   socket.on("ice-candidate", (data) => {
//     console.log(`📡 ICE Candidate from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("ice-candidate", {
//       candidate: data.candidate,
//       sender: socket.id,
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     for (const roomId in rooms) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       if (rooms[roomId].length === 0) {
//         delete rooms[roomId];
//       }
//     }
//   });
// });

// const PORT = process.env.PORT || 10000;
// server.listen(PORT, () => {
//   console.log(`🚀 Signaling server running on port ${PORT}`);
// });

// import express from "express";
// import http from "http";
// import { Server } from "socket.io";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// // Track users in rooms
// const rooms = {};

// io.on("connection", (socket) => {
//   console.log(`✅ New client connected: ${socket.id}`);

//   // When someone joins a room
//   socket.on("join", (roomId) => {
//     socket.join(roomId);
//     console.log(`📢 Client ${socket.id} joined room: ${roomId}`);

//     if (!rooms[roomId]) {
//       rooms[roomId] = [];
//     }
//     rooms[roomId].push(socket.id);

//     // Notify others in the room
//     socket.to(roomId).emit("user-joined", socket.id);
//   });

//   // Handle offer
//   socket.on("offer", (data) => {
//     console.log(`📨 Offer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("offer", data.offer || data.sdp);
//   });

//   // Handle answer
//   socket.on("answer", (data) => {
//     console.log(`📨 Answer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("answer", data.answer || data.sdp);
//   });

//   // Handle ICE candidates
//   socket.on("ice-candidate", (data) => {
//     console.log(`📡 ICE Candidate from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("ice-candidate", data.candidate);
//   });

//   // Handle leaving
//   socket.on("leave", (roomId) => {
//     console.log(`👋 Client ${socket.id} left room: ${roomId}`);
//     socket.leave(roomId);

//     if (rooms[roomId]) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       if (rooms[roomId].length === 0) {
//         delete rooms[roomId];
//       }
//     }
//     socket.to(roomId).emit("user-left", socket.id);
//   });

//   // Handle disconnect
//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     for (const roomId in rooms) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       if (rooms[roomId].length === 0) {
//         delete rooms[roomId];
//       }
//     }
//   });
// });

// const PORT = process.env.PORT || 10000;
// server.listen(PORT, () => {
//   console.log(`🚀 Signaling server running on port ${PORT}`);
// });


  //ap1// server/index.js

// import express from "express";
// import http from "http";
// import { Server } from "socket.io";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// // rooms map: roomId -> [socketIds]
// const rooms = {};

// io.on("connection", (socket) => {
//   console.log(`✅ New client connected: ${socket.id}`);

//   socket.on("join", (roomId = "global-room") => {
//     socket.join(roomId);
//     console.log(`📢 Client ${socket.id} joined room: ${roomId}`);

//     if (!rooms[roomId]) rooms[roomId] = [];
//     // avoid duplicates
//     if (!rooms[roomId].includes(socket.id)) rooms[roomId].push(socket.id);

//     // notify others
//     socket.to(roomId).emit("user-joined", { id: socket.id });
//   });

//   socket.on("offer", (data) => {
//     // { room, sdp }
//     if (!data?.room) return;
//     console.log(`📨 Offer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("offer", { sdp: data.sdp, from: socket.id });
//   });

//   socket.on("answer", (data) => {
//     // { room, sdp }
//     if (!data?.room) return;
//     console.log(`📨 Answer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("answer", { sdp: data.sdp, from: socket.id });
//   });

//   socket.on("ice-candidate", (data) => {
//     // { room, candidate }
//     if (!data?.room) return;
//     // forward candidate to others in room
//     socket.to(data.room).emit("ice-candidate", { candidate: data.candidate, from: socket.id });
//   });

//   socket.on("leave", (roomId) => {
//     if (!roomId) return;
//     socket.leave(roomId);
//     console.log(`👋 Client ${socket.id} left room: ${roomId}`);
//     if (rooms[roomId]) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       socket.to(roomId).emit("user-left", { id: socket.id });
//       if (rooms[roomId].length === 0) delete rooms[roomId];
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     for (const roomId in rooms) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       socket.to(roomId).emit("user-left", { id: socket.id });
//       if (rooms[roomId].length === 0) delete rooms[roomId];
//     }
//   });
// });

// const PORT = process.env.PORT || 10000;
// server.listen(PORT, () => {
//   console.log(`🚀 Signaling server running on port ${PORT}`);
// });

//ap1
// import express from "express";
// import http from "http";
// import { Server } from "socket.io";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// // rooms map: roomId -> [socketIds]
// const rooms = {};

// io.on("connection", (socket) => {
//   console.log(`✅ New client connected: ${socket.id}`);

//   socket.on("join", (roomId = "global-room") => {
//     socket.join(roomId);
//     console.log(`📢 Client ${socket.id} joined room: ${roomId}`);

//     if (!rooms[roomId]) rooms[roomId] = [];
//     // avoid duplicates
//     if (!rooms[roomId].includes(socket.id)) rooms[roomId].push(socket.id);

//     // notify others
//     socket.to(roomId).emit("user-joined", { id: socket.id });
//   });

//   socket.on("offer", (data) => {
//     // { room, sdp }
//     if (!data?.room) return;
//     console.log(`📨 Offer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("offer", { sdp: data.sdp, from: socket.id });
//   });

//   socket.on("answer", (data) => {
//     // { room, sdp }
//     if (!data?.room) return;
//     console.log(`📨 Answer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("answer", { sdp: data.sdp, from: socket.id });
//   });

//   socket.on("ice-candidate", (data) => {
//     // { room, candidate }
//     if (!data?.room) return;
//     // forward candidate to others in room
//     socket.to(data.room).emit("ice-candidate", { candidate: data.candidate, from: socket.id });
//   });

//   socket.on("leave", (roomId) => {
//     if (!roomId) return;
//     socket.leave(roomId);
//     console.log(`👋 Client ${socket.id} left room: ${roomId}`);
//     if (rooms[roomId]) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       socket.to(roomId).emit("user-left", { id: socket.id });
//       if (rooms[roomId].length === 0) delete rooms[roomId];
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     for (const roomId in rooms) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       socket.to(roomId).emit("user-left", { id: socket.id });
//       if (rooms[roomId].length === 0) delete rooms[roomId];
//     }
//   });
// });

// const PORT = process.env.PORT || 10000;
// server.listen(PORT, () => {
//   console.log(`🚀 Signaling server running on port ${PORT}`);
// });

  // working on 2 way
  
//   import express from "express";
// import http from "http";
// import { Server } from "socket.io";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// // rooms map: roomId -> [socketIds]
// const rooms = {};

// io.on("connection", (socket) => {
//   console.log(`✅ New client connected: ${socket.id}`);

//   socket.on("join", (roomId = "global-room") => {
//     socket.join(roomId);
//     console.log(`📢 Client ${socket.id} joined room: ${roomId}`);

//     if (!rooms[roomId]) rooms[roomId] = [];
//     if (!rooms[roomId].includes(socket.id)) rooms[roomId].push(socket.id);

//     // 🔥 Send current users to the new client
//     socket.emit("users-in-room", rooms[roomId].filter((id) => id !== socket.id));

//     // Notify others about new user
//     socket.to(roomId).emit("user-joined", { id: socket.id });
//   });

//   socket.on("offer", (data) => {
//     if (!data?.room) return;
//     console.log(`📨 Offer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("offer", { sdp: data.sdp, from: socket.id });
//   });

//   socket.on("answer", (data) => {
//     if (!data?.room) return;
//     console.log(`📨 Answer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("answer", { sdp: data.sdp, from: socket.id });
//   });

//   socket.on("ice-candidate", (data) => {
//     if (!data?.room) return;
//     socket.to(data.room).emit("ice-candidate", { candidate: data.candidate, from: socket.id });
//   });

//   socket.on("leave", (roomId) => {
//     if (!roomId) return;
//     socket.leave(roomId);
//     console.log(`👋 Client ${socket.id} left room: ${roomId}`);
//     if (rooms[roomId]) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       socket.to(roomId).emit("user-left", { id: socket.id });
//       if (rooms[roomId].length === 0) delete rooms[roomId];
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     for (const roomId in rooms) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       socket.to(roomId).emit("user-left", { id: socket.id });
//       if (rooms[roomId].length === 0) delete rooms[roomId];
//     }
//   });
// });

// const PORT = process.env.PORT || 10000;
// server.listen(PORT, () => {
//   console.log(`🚀 Signaling server running on port ${PORT}`);
// });

// turn ai

// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import twilio from 'twilio'; // 1. Import the Twilio SDK

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// // rooms map: roomId -> [socketIds]
// const rooms = {};

// // 2. Add the new API endpoint for fetching TURN credentials
// app.get('/get_turn_credentials', async (req, res) => {
//     // Replace with your actual credentials from the Twilio Console
//     const accountSid = 'ACd80ff013aecc185c298f124bd783145b'; 
//     const authToken = '92270e5c279085f64e7edc6856c656a3'; 

//     const client = twilio(accountSid, authToken);

//     try {
//         const token = await client.tokens.create();
//         res.json(token.iceServers); // This will return the complete ICE servers array
//     } catch (e) {
//         console.error("Error creating Twilio token:", e);
//         res.status(500).send("Error generating TURN credentials.");
//     }
// });

// io.on("connection", (socket) => {
//   console.log(`✅ New client connected: ${socket.id}`);

//   socket.on("join", (roomId = "global-room") => {
//     socket.join(roomId);
//     console.log(`📢 Client ${socket.id} joined room: ${roomId}`);

//     if (!rooms[roomId]) rooms[roomId] = [];
//     if (!rooms[roomId].includes(socket.id)) rooms[roomId].push(socket.id);

//     // 🔥 Send current users to the new client
//     socket.emit("users-in-room", rooms[roomId].filter((id) => id !== socket.id));

//     // Notify others about new user
//     socket.to(roomId).emit("user-joined", { id: socket.id });
//   });

//   socket.on("offer", (data) => {
//     if (!data?.room) return;
//     console.log(`📨 Offer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("offer", { sdp: data.sdp, from: socket.id });
//   });

//   socket.on("answer", (data) => {
//     if (!data?.room) return;
//     console.log(`📨 Answer from ${socket.id} for room: ${data.room}`);
//     socket.to(data.room).emit("answer", { sdp: data.sdp, from: socket.id });
//   });

//   socket.on("ice-candidate", (data) => {
//     if (!data?.room) return;
//     socket.to(data.room).emit("ice-candidate", { candidate: data.candidate, from: socket.id });
//   });

//   socket.on("leave", (roomId) => {
//     if (!roomId) return;
//     socket.leave(roomId);
//     console.log(`👋 Client ${socket.id} left room: ${roomId}`);
//     if (rooms[roomId]) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       socket.to(roomId).emit("user-left", { id: socket.id });
//       if (rooms[roomId].length === 0) delete rooms[roomId];
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//     for (const roomId in rooms) {
//       rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
//       socket.to(roomId).emit("user-left", { id: socket.id });
//       if (rooms[roomId].length === 0) delete rooms[roomId];
//     }
//   });
// });

// const PORT = process.env.PORT || 10000;
// server.listen(PORT, () => {
//   console.log(`🚀 Signaling server running on port ${PORT}`);
// });

//  new ai 
import express from "express";
import http from "http";
import { Server } from "socket.io";
import twilio from 'twilio'; 
import dotenv from 'dotenv'; // 1. Import the dotenv package

dotenv.config(); // 2. Load environment variables from a .env file

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// rooms map: roomId -> [socketIds]
const rooms = {};

// 3. Add the new API endpoint for fetching TURN credentials
app.get('/get_turn_credentials', async (req, res) => {
    // Use environment variables instead of hardcoded values
    const accountSid = process.env.TWILIO_ACCOUNT_SID; 
    const authToken = process.env.TWILIO_AUTH_TOKEN; 

    const client = twilio(accountSid, authToken);

    try {
        const token = await client.tokens.create();
        res.json(token.iceServers); // This will return the complete ICE servers array
    } catch (e) {
        console.error("Error creating Twilio token:", e);
        res.status(500).send("Error generating TURN credentials.");
    }
});

io.on("connection", (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  socket.on("join", (roomId = "global-room") => {
    socket.join(roomId);
    console.log(`📢 Client ${socket.id} joined room: ${roomId}`);

    if (!rooms[roomId]) rooms[roomId] = [];
    if (!rooms[roomId].includes(socket.id)) rooms[roomId].push(socket.id);

    // 🔥 Send current users to the new client
    socket.emit("users-in-room", rooms[roomId].filter((id) => id !== socket.id));

    // Notify others about new user
    socket.to(roomId).emit("user-joined", { id: socket.id });
  });

  socket.on("offer", (data) => {
    if (!data?.room) return;
    console.log(`📨 Offer from ${socket.id} for room: ${data.room}`);
    socket.to(data.room).emit("offer", { sdp: data.sdp, from: socket.id });
  });

  socket.on("answer", (data) => {
    if (!data?.room) return;
    console.log(`📨 Answer from ${socket.id} for room: ${data.room}`);
    socket.to(data.room).emit("answer", { sdp: data.sdp, from: socket.id });
  });

  socket.on("ice-candidate", (data) => {
    if (!data?.room) return;
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