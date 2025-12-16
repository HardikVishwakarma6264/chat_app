const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,        // smtp-relay.brevo.com
      port: process.env.MAIL_PORT || 587,
      secure: false,                      // MUST be false for 587
      auth: {
        user: process.env.MAIL_USER,      // apikey
        pass: process.env.MAIL_PASS,      // Brevo SMTP key
      },
    });

    const info = await transporter.sendMail({
      from: `"Samvaad" <hardikvishwakarma49@gmail.com>`,

      to: email,
      subject: title,
      html: body,
    });

    console.log("✅ Mail sent successfully:", info.messageId);
    return info;

  } catch (error) {
    console.log("❌ Error in sending mail:", error);
    return null;
  }
};

module.exports = mailSender;
