const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getUserConversations,
  createOrFetchConversation,
  addReaction,
  toggleStar,
  deleteMessageForMe,
  togglePin,
} = require("../controllers/message_cotroll");

const { auth } = require("../middlewares/auth");

router.post("/send/:receiverId", auth, sendMessage);
router.get("/get/:receiverId", auth, getMessages);
router.get("/conversations", auth, getUserConversations);
router.post("/create-or-fetch", auth, createOrFetchConversation);
router.post("/reaction/:messageId", auth, addReaction);
router.post("/star/:messageId", auth, toggleStar);
router.post("/delete-for-me/:messageId", auth, deleteMessageForMe);
router.post("/pin/:messageId", auth, togglePin);

module.exports = router;
