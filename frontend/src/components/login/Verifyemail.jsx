import React, { useEffect, useState } from "react";
import OtpInput from "react-otp-input";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Note: Redux and API-related imports/logic are commented out as they
// were in the original code, but are included for context.
import { signupuser, sendOtp } from "../services/operation/authapi";
import { setSignupData } from "../slices/authSlice";

const Verifyemail = () => {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signupData = useSelector((state) => state.auth.signupData);

  // 🔄 Timer related state
  const [timeLeft, setTimeLeft] = useState(300); // 3 minutes = 180 seconds
  const [timerActive, setTimerActive] = useState(true);

  // ⏳ Start timer on mount or reset
  useEffect(() => {
    let interval = null;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // 🧠 Hydrate from localStorage if needed (keeping commented for functional parity)
  useEffect(() => {
    if (!signupData) {
      try {
        const saved = localStorage.getItem("signupData");
        if (saved) {
          dispatch(setSignupData(JSON.parse(saved)));
        } else {
          navigate("/signup");
        }
      } catch {
        navigate("/signup");
      }
    }
  }, [signupData, dispatch, navigate]);

  // 🔐 Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!signupData) return;

    const { firstname, lastname, email, password, confirmpassword } =
      signupData;

    dispatch(
      signupuser(
        firstname,
        lastname,
        email,
        password,
        confirmpassword,
        otp,
        navigate
      )
    );
  };

  // 🔁 Resend OTP + restart timer
  const handleResend = () => {
    // API call logic (commented out)
    if (!signupData?.email) return;
    dispatch(sendOtp(signupData.email, navigate));
    setTimeLeft(300); // reset 3 mins
    setTimerActive(true);
  };

  // 🕓 Format time for display (mm:ss)
  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  // 🚀 Auto-submit when 6-digit OTP is filled
  useEffect(() => {
    // Only attempt to submit if the OTP is exactly 6 digits and contains only numbers
    if (otp.length === 6 && /^[0-9]{6}$/.test(otp)) {
      // Pass a synthetic event object to mimic a form submission
      handleSubmit({ preventDefault: () => {} });
    }
  }, [otp]); // Added otp as a dependency

  return (
    <>
      {/* Custom CSS block for the animated background gradient (Copied from Signup) */}
      <style jsx>{`
        /* Keyframes for a subtle, infinite background movement */
        @keyframes subtle-move {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
        /* The main background style: dark gradient with slow animation */
        .animated-bg {
          /* Using deep dark colors: deep blue, indigo, and black */
          background: linear-gradient(
            -45deg,
            #0a0a0a,
            #1a1a2e,
            #0d1a2f,
            #0a0a0a
          );
          background-size: 400% 400%;
          animation: subtle-move 20s ease infinite; /* 20s slow loop */
          filter: blur(
            0.2px
          ); /* Very subtle blur for a soft, dark ambient look */
        }
      `}</style>

      {/* Main container with the animated background */}
      <div className="min-h-screen flex justify-center items-center text-white p-4 font-['Inter'] animated-bg">
        {/* Card container with shadow and sleek dark background */}
        <div
          className="bg-[#151515] p-10 rounded-xl shadow-2xl w-[450px] text-center 
                        border border-gray-800 relative overflow-hidden backdrop-blur-sm"
        >
          {/* Subtle Corner Glows (Matching Signup) */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/60 blur-3xl rounded-full translate-x-[50%] translate-y-[-50%]"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-500/60 blur-3xl rounded-full translate-x-[-50%] translate-y-[50%]"></div>

          <div className="relative z-10">
            {" "}
            {/* Ensure content is above glows */}
            <h2 className="text-3xl font-bold mb-3 text-cyan-400 drop-shadow-md shadow-cyan-400/50">
              Verify Email
            </h2>
            <p className="text-gray-400 mb-8 px-4 text-sm font-light">
              A verification code has been sent to your email address. Please
              enter the 6-digit code below to proceed.
            </p>
            <form onSubmit={handleSubmit}>
              {/* OTP Input Field */}
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderInput={(props) => <input {...props} />}
                containerStyle="flex justify-center gap-2 md:gap-3 mb-8"
                inputStyle={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#1D1D1D",
                  color: "white",
                  fontSize: "20px",
                  textAlign: "center",
                  borderRadius: "6px",
                  border: "1px solid #333",
                  boxShadow: "none",
                }}
                focusStyle={{
                  // Focus border color matching the 'Start Chatting' button blue/cyan
                  border: "2px solid #00C0FF",
                  outline: "none",
                }}
                autoFocus
                shouldAutoFocus
              />

              {/* Verify Button - Matched with Signup's style and glow */}
              {otp.length < 6 && (
                <button
                  type="submit"
                  className="bg-cyan-500 text-gray-900 w-full py-3 rounded-xl font-bold text-lg 
                  hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/30"
                >
                  Verify Email
                </button>
              )}
            </form>
            {/* Footer Links and Timer */}
            <div className="flex justify-between items-center mt-6 text-sm">
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 font-medium"
              >
                <span className="text-lg">←</span> Back to Signup
              </button>

              <div className="flex items-center gap-2">
                {timerActive ? (
                  // Timer Display
                  <span className="text-gray-400 font-mono">
                    {formatTime(timeLeft)}
                  </span>
                ) : (
                  // Resend Button
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-cyan-500 hover:underline disabled:text-gray-600 font-medium"
                    disabled={timerActive}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Verifyemail;
