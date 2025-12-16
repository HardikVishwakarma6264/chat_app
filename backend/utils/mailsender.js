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


// const nodemailer = require("nodemailer");

// const mailSender = async (email, title, body) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST,        // smtp-relay.brevo.com
//       port: process.env.MAIL_PORT || 587,
//       secure: false,                      // MUST be false for 587
//       auth: {
//         user: process.env.MAIL_USER,      // apikey
//         pass: process.env.MAIL_PASS,      // Brevo SMTP key
//       },
//     });

//     const info = await transporter.sendMail({
//       from: `"Samvaad" <hardikvishwakarma49@gmail.com>`,

//       to: email,
//       subject: title,
//       html: body,
//     });

//     console.log("✅ Mail sent successfully:", info.messageId);
//     return info;

//   } catch (error) {
//     console.log("❌ Error in sending mail:", error);
//     return null;
//   }
// };

// module.exports = mailSender;

const axios = require("axios");

const mailSender = async (email, title, body) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Samvaad",
          email: "hardikvishwakarma49@gmail.com",
        },
        to: [
          {
            email: email,
          },
        ],
        subject: title,
        htmlContent: body,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("✅ Email sent successfully:", response.data);
    return response.data;

  } catch (error) {
    console.error(
      "❌ Email send failed:",
      error.response?.data || error.message
    );
    return null;
  }
};

module.exports = mailSender;

