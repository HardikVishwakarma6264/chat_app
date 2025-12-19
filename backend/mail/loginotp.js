function otpMailTemplate(otp) {
  const title = "Samvaad OTP Verification";

  const body = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">

    <!-- Header with logo -->
    <div style="text-align: center; margin-bottom: 10px; padding: 20px; border-radius: 20px 20px 0 0; background: linear-gradient(90deg, #25D366, #128C7E); color: white;">
      <img 
  src="https://res.cloudinary.com/dfhqweit4/image/upload/v1765097174/logo-removebg-preview_tsifl4.png" 
  alt="Samvaad Logo"
  style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 4px;"
/>
      
      <p style="margin: 3px 0 0 0; font-size: 16px;">Your real-time chat companion</p>
    </div>

    <!-- Body -->
    <div style="padding: 20px; text-align: center; color: #333;">
      <h2 style="margin-bottom: 10px;">OTP Verification</h2>
      <p>Hi Buddy,</p>
      <p>Use the OTP below to verify your Samvaad account. It's valid for <b>5 minutes</b>.</p>

      <!-- OTP Box -->
      <div style="
        display: inline-block;
        margin: 25px 0;
        padding: 18px 40px;
        border-radius: 12px;
        font-size: 32px;
        font-weight: bold;
        color: #ffffff;
        background: linear-gradient(270deg, #25D366, #128C7E, #25D366);
        background-size: 600% 600%;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: gradientAnimation 4s ease infinite;
      ">
        ${otp}
      </div>

      <p style="color: #555; font-size: 14px; margin-top: 20px;">
        If you did not request this, please ignore this email.
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

    <!-- Footer -->
    <p style="font-size: 12px; text-align: center; color: #888;">
      Samvaad – Real-time Chat App <br/>
      Questions? Contact us at <a href="mailto:support@sanvaad.com" style="color: #25D366;">support@sanvaad.com</a>
    </p>
  </div>

  <!-- Gradient Animation -->
  <style>
    @keyframes gradientAnimation {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  </style>
  `;

  return { title, body };
}

module.exports = otpMailTemplate;
