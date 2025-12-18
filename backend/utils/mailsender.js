// const nodemailer = require("nodemailer");

// const mailSender = async (email, title, body) => {
//   try {
//     // transporter setup
//     let transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST, // Example: smtp.gmail.com
//       port: 587, // Gmail ke liye 587 (TLS) ya 465 (SSL)
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: process.env.MAIL_USER, // your email
//         pass: process.env.MAIL_PASS, // your email password / app password
//       },
//     });

//     // send mail
//     let info = await transporter.sendMail({
//       // from:process.env.MAIL_USER,
//       from: `"Samvaad " <${process.env.MAIL_USER}>`,
//       to: `${email}`,
//       subject: `${title}`,
//       html: `${body}`,
//     });

//     console.log("✅ Mail sent successfully:", info.messageId);
//     return info;
//   } catch (error) {
//     console.log("❌ Error in sending mail:", error.message);
//     return null;
//   }
// };

// module.exports = mailSender;

const axios = require("axios");

const mailSender = async (email, title, body) => {
  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
       from: "Sanvaad <support@hardikvish.me>",
        to: [email],
        subject: title,
        html: body,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("✅ Email sent via Resend:", response.data);
    return response.data;

  } catch (error) {
    console.error(
      "❌ Resend email failed:",
      error.response?.data || error.message
    );
    return null;
  }
};

module.exports = mailSender;

