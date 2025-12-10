const express = require("express");
const router = express.Router();

const {
  login,
  signup,
  sendotp,
  logout,
  otherusers,
  updateProfileImage,
  updateAbout,
  updateContactNumber,
  updateUsername,
  deleteAccount,
  googleLogin,
} = require("../controllers/Auth");

const { auth } = require("../middlewares/auth");

//routes for login, signup, and authentication

router.post("/login", login);
router.post("/signup", signup);
router.post("/sendotp", sendotp);
router.post("/logout", auth, logout);
router.get("/otherusers", auth, otherusers);
router.post("/update-image", auth, updateProfileImage);
router.put("/update-about", auth, updateAbout);
router.put("/update-contact", auth, updateContactNumber);
router.put("/update-username", auth, updateUsername);
router.delete("/delete-account", auth, deleteAccount);
router.post("/google-login", googleLogin);

module.exports = router;
