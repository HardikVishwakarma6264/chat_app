const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");

exports.otherfriend = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await User.find({ _id: { $ne: currentUserId } }).select(
      "firstname lastname email image _id"
    );

    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: `${user.firstname || ""} ${user.lastname || ""}`.trim(),
      email: user.email,
      image: user.image,
    }));

    return res.status(200).json({
      success: true,
      message: "Other users fetched successfully",
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching other users:", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch users, please try again!",
    });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId)
      return res
        .status(400)
        .json({ success: false, message: "receiverId required" });

    if (receiverId.toString() === senderId.toString())
      return res
        .status(400)
        .json({ success: false, message: "Cannot send request to yourself" });

    // delete old rejected requests
    await FriendRequest.deleteMany({
      sender: senderId,
      receiver: receiverId,
      status: "rejected",
    });

    // block only if PENDING request exists
    const existing = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Request already pending" });
    }

    const request = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    await request.populate("sender", "firstname lastname image");

    return res.status(201).json({
      success: true,
      message: "Friend request sent",
      request,
    });
  } catch (error) {
    console.error("sendFriendRequest error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "firstname lastname image");

    const formatted = requests.map((r) => ({
      id: r._id,
      senderId: r.sender._id,
      name: `${r.sender.firstname || ""} ${r.sender.lastname || ""}`.trim(),
      image: r.sender.image,
      status: r.status,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({ success: true, requests: formatted });
  } catch (error) {
    console.error("getIncomingRequests error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;
    const { action } = req.body;

    if (!["accept", "reject"].includes(action))
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });

    const reqDoc = await FriendRequest.findById(requestId);
    if (!reqDoc)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    if (reqDoc.receiver.toString() !== userId.toString())
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    reqDoc.status = action === "accept" ? "accepted" : "rejected";
    await reqDoc.save();
    await reqDoc.populate("sender", "firstname lastname image");

    return res.status(200).json({
      success: true,
      message: `Request ${reqDoc.status}`,
      request: {
        id: reqDoc._id,
        senderId: reqDoc.sender._id,
        name: `${reqDoc.sender.firstname || ""} ${
          reqDoc.sender.lastname || ""
        }`.trim(),
        image: reqDoc.sender.image,
        status: reqDoc.status,
      },
    });
  } catch (error) {
    console.error("respondToRequest error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await FriendRequest.find({
      sender: userId,
    }).populate("receiver", "firstname lastname image");

    const formatted = requests.map((r) => ({
      userId: r.receiver._id.toString(),
      name: `${r.receiver.firstname || ""} ${r.receiver.lastname || ""}`,
      image: r.receiver.image,
      status: r.status, // pending / accepted / rejected
    }));

    return res.status(200).json({
      success: true,
      outgoing: formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAcceptedFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const accepted = await FriendRequest.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    })
      .populate("sender", "firstname lastname image")
      .populate("receiver", "firstname lastname image");

    const friends = accepted.map((r) => {
      const friend =
        r.sender._id.toString() === userId.toString() ? r.receiver : r.sender;

      return {
        userId: friend._id,
        name: `${friend.firstname} ${friend.lastname}`,
        image: friend.image,
      };
    });

    return res.status(200).json({
      success: true,
      friends,
    });
  } catch (error) {
    console.error("getAcceptedFriends error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
