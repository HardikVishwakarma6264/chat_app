const mongoose = require("mongoose");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { uploadToCloudinary } = require("../utils/imageuploder");
const { getReceiverSocketId, getIO } = require("../socket/socket");

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    const { message, replyTo } = req.body;

    if (!senderId || !receiverId)
      return res
        .status(400)
        .json({ success: false, message: "Missing sender or receiver" });

    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    )
      return res
        .status(400)
        .json({ success: false, message: "Invalid user IDs" });

    // 🟩 Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    let mediaUrl = null;
    let fileType = null;

    // 🟩 Handle file upload
    if (req.files && req.files.file) {
      const file = req.files.file;
      let folder = "chat-uploads";
      let resourceType = "auto";

      if (file.mimetype.startsWith("image")) {
        folder = "chat-images";
        resourceType = "image";
      } else if (file.mimetype.startsWith("video")) {
        folder = "chat-videos";
        resourceType = "video";
      } else {
        folder = "chat-documents";
        resourceType = "raw";
      }

      const uploaded = await uploadToCloudinary(file, folder, resourceType);
      mediaUrl = uploaded.secure_url;
      fileType = file.mimetype;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: message || "",
      mediaUrl,
      fileType,
      replyTo: replyTo || null, // ⭐ ADD THIS
    });

    // 🟩 Update conversation
    conversation.messages.push(newMessage._id);
    conversation.lastMessage =
      message ||
      (fileType?.startsWith("image")
        ? "📷 Image"
        : fileType?.startsWith("video")
        ? "🎥 Video"
        : fileType?.startsWith("audio")
        ? "🎤 Voice Message"
        : "📄 File");
    conversation.lastMessageTime = new Date();

    // ✅ Add receiver in unreadBy if message is new and receiver isn't viewing
    if (!conversation.unreadBy.includes(receiverId)) {
      conversation.unreadBy.push(receiverId);
    }

    await conversation.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("replyTo")
      .lean();

    // 🟩 Emit message in real-time
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);
    const io = getIO();

    const updatedPayload = {
      chatId: conversation._id,
      receiverId,
      senderId,
      lastMessage: conversation.lastMessage,
      lastMessageTime: conversation.lastMessageTime,
    };

    // Mark message delivered
    if (receiverSocketId) {
      newMessage.delivered = true;
      await newMessage.save();

      io.to(senderSocketId).emit("messageDelivered", {
        messageId: newMessage._id,
      });
    }

    if (io) {
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", populatedMessage);
        io.to(receiverSocketId).emit("messageUpdated", updatedPayload);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageUpdated", updatedPayload);
      }
    }

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate({
      path: "messages",
      populate: { path: "replyTo" }, // ⭐ MOST IMPORTANT
    });

    // ✅ mark as read (remove current user from unreadBy)
    if (conversation) {
      conversation.unreadBy = conversation.unreadBy.filter(
        (id) => id.toString() !== senderId.toString()
      );
      await conversation.save();
    }

    await Message.updateMany(
      { senderId: receiverId, receiverId: senderId, read: false },
      { $set: { read: true } }
    );

    // Send read receipt to sender
    const io = getIO();
    const senderSocketId = getReceiverSocketId(receiverId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageRead", {
        readerId: senderId,
      });
    }

    if (!conversation) return res.json({ success: true, messages: [] });

    const filtered = conversation.messages.filter(
      (m) => !m.deletedFor?.includes(senderId)
    );

    res.status(200).json({
      success: true,
      messages: filtered,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
};

exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "name image firstname lastname")
      .sort({ updatedAt: -1 })
      .lean();

    // 🟩 Add unread count
    const formatted = conversations.map((c) => ({
      ...c,
      unreadCount: c.unreadBy?.filter(
        (id) => id.toString() === userId.toString()
      ).length,
    }));

    res.status(200).json({ success: true, conversations: formatted });
  } catch (err) {
    console.error("getUserConversations Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching conversations" });
  }
};

exports.createOrFetchConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId)
      return res
        .status(400)
        .json({ success: false, message: "receiverId required" });

    // 1️⃣ Check if conversation exists
    let convo = await Conversation.findOne({
      participants: { $all: [userId, receiverId] },
    }).populate("participants", "firstname lastname image");

    // 2️⃣ If not create new
    if (!convo) {
      convo = await Conversation.create({
        participants: [userId, receiverId],
      });

      convo = await Conversation.findById(convo._id).populate(
        "participants",
        "firstname lastname image"
      );
    }

    // 3️⃣ format for frontend
    const other = convo.participants.find(
      (p) => p._id.toString() !== userId.toString()
    );

    return res.status(200).json({
      success: true,
      conversation: {
        id: convo._id,
        userId: other._id,
        name: `${other.firstname} ${other.lastname}`,
        image: other.image,
      },
    });
  } catch (err) {
    console.log("Convo create error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.addReaction = async (req, res) => {
  try {
    const { emoji, userId } = req.body;
    const { messageId } = req.params;

    // 1️⃣ Update reaction in message
    const updated = await Message.findByIdAndUpdate(
      messageId,
      {
        $set: { reaction: { emoji, userId } },
      },
      { new: true }
    );

    // 2️⃣ Find conversation
    const convo = await Conversation.findOne({
      messages: { $in: [messageId] },
    });

    if (convo) {
      // 3️⃣ Update lastMessage in conversation
      convo.lastMessage = `Reacted to ${emoji}`;
      convo.lastMessageTime = new Date();
      await convo.save();
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

exports.toggleStar = async (req, res) => {
  try {
    const { messageId } = req.params;

    const msg = await Message.findById(messageId);
    if (!msg) return res.json({ success: false, message: "Message not found" });

    msg.isStarred = !msg.isStarred;
    await msg.save();

    // ⭐ Update conversation lastMessage
    const conversation = await Conversation.findOne({
      messages: { $in: [messageId] },
    });

    if (conversation) {
      conversation.lastMessage = msg.isStarred
        ? "⭐ Message starred"
        : "Message unstarred";
      conversation.lastMessageTime = new Date();
      await conversation.save();
    }

    // ⭐ Emit to both users
    const io = getIO();
    const receiverSocketId = getReceiverSocketId(msg.receiverId);
    const senderSocketId = getReceiverSocketId(msg.senderId);

    const payload = {
      messageId,
      isStarred: msg.isStarred,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      lastMessage: conversation.lastMessage,
      lastMessageTime: conversation.lastMessageTime,
    };

    if (receiverSocketId) io.to(receiverSocketId).emit("receiveStar", payload);
    if (senderSocketId) io.to(senderSocketId).emit("receiveStar", payload);

    res.json({ success: true, data: msg });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

exports.deleteMessageForMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message)
      return res.json({ success: false, message: "Message not found" });

    // 🔥 Delete only for this user — not for other person
    if (!message.deletedFor) message.deletedFor = [];
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
    }

    await message.save();

    return res.json({
      success: true,
      message: "Deleted for me",
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const { messageId } = req.params;

    const msg = await Message.findById(messageId);
    if (!msg) return res.json({ success: false, message: "Message not found" });

    // Toggle pin
    msg.pinned = !msg.pinned;

    if (msg.pinned) {
      msg.pinnedBy = req.user.id; // ★ pin karne wala user store
    } else {
      msg.pinnedBy = null; // ★ unpin kare to null
    }

    await msg.save();

    // Conversation update
    const conversation = await Conversation.findOne({
      messages: { $in: [messageId] },
    });

    if (conversation) {
      conversation.lastMessage = msg.pinned
        ? "📌 Pinned a message"
        : "Unpinned a message";
      conversation.lastMessageTime = new Date();
      await conversation.save();
    }

    // send via socket
    const io = getIO();
    const receiverSocketId = getReceiverSocketId(msg.receiverId);
    const senderSocketId = getReceiverSocketId(msg.senderId);

    const payload = {
      messageId,
      pinned: msg.pinned,
      pinnedBy: msg.pinnedBy, // ⭐ add this
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      lastMessage: conversation.lastMessage,
      lastMessageTime: conversation.lastMessageTime,
    };

    if (receiverSocketId) io.to(receiverSocketId).emit("receivePin", payload);
    if (senderSocketId) io.to(senderSocketId).emit("receivePin", payload);

    return res.json({ success: true, data: msg });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
};
