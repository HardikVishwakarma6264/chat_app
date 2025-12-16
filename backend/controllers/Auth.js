const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/Otp");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailsender");
require("dotenv").config();
const Profile = require("../models/Profile");
const otpMailTemplate = require("../mail/loginotp");
const { uploadToCloudinary } = require("../utils/imageuploder");

exports.googleLogin = async (req, res) => {
  try {
    const { name, email, image } = req.body;

    let user = await User.findOne({ email }).populate("additionaldetail");

    if (!user) {
      const profiledetail = await Profile.create({
        gender: null,
        username:
          name.replace(" ", "_") + "_" + Math.floor(Math.random() * 10000),
        about: null,
        contactnumber: null,
      });

      user = await User.create({
        firstname: name.split(" ")[0],
        lastname: name.split(" ")[1] || "",
        email,
        password: "GOOGLE_AUTH",
        image,
        additionaldetail: profiledetail._id,
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    user.password = undefined;

    return res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Google Login Failed",
    });
  }
};

exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    // check if user already exists
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(409).json({
        success: false,
        message: "User already registered",
      });
    }

    // generate OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    // console.log("OTP GENERATED ->", otp);

    // check uniqueness
    let result = await OTP.findOne({ otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp });
    }

    // save otp
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Saved:", otpBody);

    const { title, body } = otpMailTemplate(otp);
    await mailSender(email, title, body);

    // send response
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp: otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password, confirmpassword, otp } =
      req.body;

    console.log("Received Body: ", req.body);

    // ✅ Validation
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !confirmpassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match!",
      });
    }

    // ✅ Check if user already exists
    const existinguser = await User.findOne({ email });
    if (existinguser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered, try another email!",
      });
    }

    // ✅ Find most recent OTP
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log("Recent OTP:", recentOtp);

    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ✅ Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // ✅ Generate a unique default username
    const baseUsername = `${firstname.toLowerCase()}_${lastname.toLowerCase()}`;
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const defaultUsername = `${baseUsername}_${randomNumber}`;

    // ✅ Encode names safely for URL
    const encodedFirst = encodeURIComponent(firstname);
    const encodedLast = encodeURIComponent(lastname);

    // ✅ Generate UI Avatar URL (with random background)
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodedFirst}+${encodedLast}&background=random`;

    // ✅ Create profile document (with username)
    const profiledetail = await Profile.create({
      gender: null,
      username: defaultUsername, // 🔹 Default username added
      about: null,
      contactnumber: null,
    });

    // ✅ Create user
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashPassword,
      additionaldetail: profiledetail._id,
      image: avatarUrl,
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully with default username",
      user,
    });
  } catch (error) {
    console.log("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered, please try again!",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required!",
      });
    }

    const user = await User.findOne({ email }).populate("additionaldetail");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please signup",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    const payload = {
      email: user.email,
      id: user._id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    user.token = token;
    user.password = undefined;

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: "None",
    };

    return res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login failed, please try again!",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "None",
      secure: true, // ✅ add this for Chrome & HTTPS (needed with sameSite: None)
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Logout failed, please try again!",
    });
  }
};

exports.otherusers = async (req, res) => {
  try {
    const currentUserId = req.user.id; // ✅ Current logged-in user ID from token

    // ✅ Fetch all users except current one
    const users = await User.find({ _id: { $ne: currentUserId } }).select(
      "firstname lastname email image _id"
    ); // ✅ Only useful fields

    // ✅ Format users for frontend
    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: `${user.firstname} ${user.lastname}`,
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

exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res
        .status(400)
        .json({ success: false, message: "No image file uploaded" });
    }

    const file = req.files.image;

    // Upload to Cloudinary
    const uploadedImage = await uploadToCloudinary(file, "profile-images");

    // Update DB
    const userId = req.user.id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: uploadedImage.secure_url },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: updatedUser.image, // ✅ Add this
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update Image Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateAbout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { about } = req.body;

    if (!about) {
      return res.status(400).json({
        success: false,
        message: "About field is required",
      });
    }

    // Find user and populate the profile
    const user = await User.findById(userId).populate("additionaldetail");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update about field
    user.additionaldetail.about = about;
    await user.additionaldetail.save();

    // Fetch updated user
    const updatedUser = await User.findById(userId)
      .populate("additionaldetail")
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "About updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating about:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating about",
      error: error.message,
    });
  }
};

exports.updateContactNumber = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contactnumber } = req.body;

    if (!contactnumber) {
      return res.status(400).json({
        success: false,
        message: "Contact number is required",
      });
    }

    const user = await User.findById(userId).populate("additionaldetail");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.additionaldetail.contactnumber = contactnumber;
    await user.additionaldetail.save();

    const updatedUser = await User.findById(userId)
      .populate("additionaldetail")
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "Contact number updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating contact number:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating contact number",
      error: error.message,
    });
  }
};

exports.updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).populate("additionaldetail");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.additionaldetail.username = username;
    await user.additionaldetail.save();

    const updatedUser = await User.findById(userId)
      .populate("additionaldetail")
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "Username updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating username" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ✅ Delete Profile
    await Profile.findByIdAndDelete(user.additionaldetail);

    // ✅ Delete OTP records (if any)
    await OTP.deleteMany({ email: user.email });

    // ✅ Delete User
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted permanently",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
};
