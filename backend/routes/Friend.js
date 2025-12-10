const express = require("express");
const router = express.Router();
const {
  otherfriend,
  sendFriendRequest,
  getIncomingRequests,
  respondToRequest,
  getOutgoingRequests,
  getAcceptedFriends,
} = require("../controllers/Friends_contorll");

const { auth } = require("../middlewares/auth");

router.get("/otherfriend", auth, otherfriend);
router.post("/request", auth, sendFriendRequest);
router.get("/requests/incoming", auth, getIncomingRequests);
router.post("/requests/:id/respond", auth, respondToRequest);
router.get("/outgoing", auth, getOutgoingRequests);
router.get("/accepted", auth, getAcceptedFriends);

module.exports = router;
