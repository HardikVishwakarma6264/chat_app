const moongose = require("mongoose");
const mailsender = require("../utils/mailsender");

const otpschema = new moongose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 10 * 60,
  },
});

async function sendverificationemail(email, otp) {
  try {
    const mailresponse = await mailsender(
      email,
      "Verifiaction Email for Login",
      otp
    );
    console.log("email send successfully", mailresponse);
  } catch (error) {
    console.log("error accured while sending mail", error);
    throw error;
  }
}

module.exports = moongose.model("OTP", otpschema);
