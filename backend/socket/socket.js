import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}
const callPartners = {}; // {userId: userId of the peer they're in a call with}

const endCallForUser = (userId) => {
  const partnerId = callPartners[userId];
  if (!partnerId) return;
  delete callPartners[userId];
  delete callPartners[partnerId];
  const partnerSocketId = userSocketMap[partnerId];
  if (partnerSocketId) {
    io.to(partnerSocketId).emit("call:ended", { from: userId });
  }
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ---- Typing indicators (ephemeral relay, no persistence) ----

  socket.on("typing:start", ({ to }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("typing:start", { from: userId });
    }
  });

  socket.on("typing:stop", ({ to }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("typing:stop", { from: userId });
    }
  });

  // ---- Call signaling (WebRTC) ----

  socket.on("call:initiate", async ({ to, callType, caller }) => {
    try {
      const me = await User.findById(userId).select("friends");
      const isFriend = me?.friends?.some((f) => f.toString() === to);
      if (!isFriend) {
        socket.emit("call:forbidden", { to });
        return;
      }
    } catch {
      socket.emit("call:forbidden", { to });
      return;
    }
    const calleeSocketId = userSocketMap[to];
    if (!calleeSocketId) {
      socket.emit("call:unavailable", { to });
      return;
    }
    if (callPartners[to]) {
      socket.emit("call:busy", { to });
      return;
    }
    io.to(calleeSocketId).emit("call:incoming", { callType, caller });
  });

  socket.on("call:accept", ({ to }) => {
    const callerSocketId = userSocketMap[to];
    if (!callerSocketId) {
      socket.emit("call:ended", { from: to });
      return;
    }
    callPartners[userId] = to;
    callPartners[to] = userId;
    io.to(callerSocketId).emit("call:accepted", { from: userId });
  });

  socket.on("call:reject", ({ to }) => {
    const callerSocketId = userSocketMap[to];
    if (callerSocketId) {
      io.to(callerSocketId).emit("call:rejected", { from: userId });
    }
  });

  socket.on("call:end", ({ to }) => {
    if (callPartners[userId]) {
      endCallForUser(userId);
    } else if (to) {
      // the call never connected (still ringing) — notify the peer directly
      const peerSocketId = userSocketMap[to];
      if (peerSocketId) {
        io.to(peerSocketId).emit("call:ended", { from: userId });
      }
    }
  });

  socket.on("webrtc:offer", ({ to, offer }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc:offer", { from: userId, offer });
    }
  });

  socket.on("webrtc:answer", ({ to, answer }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc:answer", { from: userId, answer });
    }
  });

  socket.on("webrtc:ice-candidate", ({ to, candidate }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc:ice-candidate", { from: userId, candidate });
    }
  });

  // socket.on() is used to listen to the events. can be used both on client and server side
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    // only clean up if the map still points at THIS socket — a stale socket's
    // late disconnect (reconnects, StrictMode double-mount) must not evict the
    // user's live connection from the map
    if (userId && userId !== "undefined" && userSocketMap[userId] === socket.id) {
      endCallForUser(userId);
      delete userSocketMap[userId];
      console.log(`User ${userId} removed from socket map`);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

export { app, io, server };
