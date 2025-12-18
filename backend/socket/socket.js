const { Server } = require("socket.io");

let io;
const userSocketMap = {}; // { userId: socketId }

function initSocket(server) {
  // io = new Server(server, {
  //   cors: {
  //     origin: "http://localhost:3000",
  //     methods: ["GET", "POST"],
  //     credentials: true,
  //   },
  //   pingTimeout: 60000,
  // });

  const allowedOrigins = [
  "http://localhost:3000",
  "https://your-frontend-vercel-url.vercel.app"
];

io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
});


  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("joinChat", (userId) => {
      if (userId) {
        userSocketMap[userId] = socket.id;
        console.log("✅ User joined:", userId);
      }
    });

    socket.on("send-friend-request", ({ toUserId, request }) => {
      const targetSocket = userSocketMap[toUserId];
      if (targetSocket) {
        io.to(targetSocket).emit("friend-request", request);
      }
    });

    socket.on("sendReaction", (data) => {
      // data = { messageId, emoji, userId }
      io.emit("receiveReaction", data);
    });

    socket.on("friend-request-response", ({ toUserId, response }) => {
      const targetSocket = userSocketMap[toUserId];
      if (targetSocket) {
        io.to(targetSocket).emit("friend-request-updated", response);
      }
    });

    // 🟢 USER STARTED TYPING
socket.on("typing", ({ senderId, receiverId }) => {
  const targetSocket = userSocketMap[receiverId];
  if (targetSocket) {
    io.to(targetSocket).emit("typing", { senderId });
  }
});

// 🔴 USER STOPPED TYPING
socket.on("stopTyping", ({ senderId, receiverId }) => {
  const targetSocket = userSocketMap[receiverId];
  if (targetSocket) {
    io.to(targetSocket).emit("stopTyping", { senderId });
  }
});


    // 📞 1. Caller sends offer (to user ID)
    socket.on("call-user", ({ to, offer, callerId, callType }) => {
      const targetSocket = userSocketMap[to]; // Get Callee's socket ID from user ID
      if (targetSocket) {
        console.log(`Incoming ${callType} call from ${callerId} to ${to}`);
        io.to(targetSocket).emit("incoming-call", {
          fromSocketId: socket.id, // correct
          offer,
          callerId: socket.id, // FIXED
          callType,
        });
      }
    });

    socket.on("get-socket-id", (userId) => {
      const target = userSocketMap[userId];
      socket.emit("socket-id-result", { userId, socketId: target });
    });

    // 🤝 2. Callee accepts and sends answer (to Caller's socket ID)
    socket.on("answer-call", ({ to, answer }) => {
      console.log(`Call answered. Sending answer to ${to}`);
      io.to(to).emit("call-accepted", { answer });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      let targetSocket;

      // If "to" is a socket id
      if (io.sockets.sockets.get(to)) {
        targetSocket = to;
      }
      // If "to" is a userId
      else {
        targetSocket = userSocketMap[to];
      }

      if (targetSocket) {
        io.to(targetSocket).emit("ice-candidate", { candidate });
      }
    });

    // 🚫 4. Call ended or rejected (to user ID)
    socket.on("end-call", ({ to }) => {
      const targetSocket = userSocketMap[to];
      if (targetSocket) {
        console.log(`Call ended by ${to}`);
        io.to(targetSocket).emit("call-ended");
      }
    });

    socket.on("mark-messages-read", async ({ userId, otherUserId }) => {
      try {
        const convo = await Conversation.findOne({
          participants: { $all: [userId, otherUserId] },
        });

        if (!convo) return;

        // 🧽 Remove unread
        convo.unreadBy = convo.unreadBy.filter(
          (id) => id.toString() !== userId.toString()
        );

        await convo.save();

        // notify frontend to update unread
        const receiverSocket = userSocketMap[userId];
        if (receiverSocket) {
          io.to(receiverSocket).emit("messages-read", {
            chatWith: otherUserId,
            unread: 0,
          });
        }
      } catch (err) {
        console.log("mark read error:", err);
      }
    });

    // 🔴 Disconnect
    socket.on("disconnect", () => {
      for (const [userId, socketId] of Object.entries(userSocketMap)) {
        if (socketId === socket.id) {
          delete userSocketMap[userId];
          console.log("❌ User disconnected:", userId);
          break;
        }
      }
    });
  });

  return io;
}

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

function getIO() {
  return io;
}

module.exports = { initSocket, getReceiverSocketId, getIO };
