import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import loo from "../images/logo-removebg-preview.png";

import { useDispatch } from "react-redux";

import { setSignupData } from "../../components/slices/authSlice";
import { sendOtp } from "../../components/services/operation/authapi";

const EyeIcon = ({ size = 20, className = "text-gray-400" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeInvisibleIcon = ({ size = 20, className = "text-gray-400" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.94 4.19M2 2l20 20"></path>
  </svg>
);

const UserIcon = ({ size = 20, className = "" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MailIcon = ({ size = 20, className = "" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LockIcon = ({ size = 20, className = "" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const LogInIcon = ({ size = 20, className = "" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
    <polyline points="10 17 15 12 10 7"></polyline>
    <line x1="15" y1="12" x2="3" y2="12"></line>
  </svg>
);

// Helper function to check if a string is empty (including whitespace)
const isEmpty = (value) => !value || value.trim() === "";

// --- Custom Input Component ---
const CustomInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  isPassword = false,
  icon: Icon,
  show,
  toggleShow,
}) => (
  <div className="relative w-full">
    <label className="block mb-2 text-xl  text-gray-200">
      {label} {required && <span className="text-red-400">*</span>}
    </label>

    <div
      className={`relative flex items-center bg-transparent border-b-2 transition-all duration-300 ${
        error
          ? "border-red-500"
          : "border-gray-700 focus-within:border-cyan-400"
      } rounded-t-md`}
    >
      {Icon && (
        <div className="p-3 text-gray-300">
          <Icon size={20} />
        </div>
      )}

      <input
        type={isPassword ? (show ? "text" : "password") : type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-full p-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
        required={required}
      />

      {isPassword && (
        <span
          className="p-3 cursor-pointer text-gray-400 hover:text-cyan-400 transition"
          onClick={toggleShow}
        >
          {show ? <EyeInvisibleIcon size={20} /> : <EyeIcon size={20} />}
        </span>
      )}
    </div>

    {error && (
      <p className="text-xs text-red-400 mt-1.5 font-medium italic">{error}</p>
    )}
  </div>
);

// --- Notification Component (Replaces react-hot-toast) ---
const Notification = ({ message, type, clearNotification }) => {
  if (!message) return null;

  const styleMap = {
    success: "bg-green-500 border-green-700",
    error: "bg-red-500 border-red-700",
    info: "bg-cyan-500 border-cyan-700",
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`px-6 py-3 rounded-xl text-white font-semibold shadow-2xl border-2 ${
          styleMap[type] || styleMap.info
        }`}
      >
        {message}
        <button
          className="ml-4 text-sm opacity-80 hover:opacity-100"
          onClick={clearNotification}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// --- Main App Component (Renamed from Signup) ---
const App = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => setShowSplash(false), 3000); // 1.8 seconds
  }, []);

  // Local state for notification (replaces Toaster)
  const [notification, setNotification] = useState(null);

  // Clear notification after a few seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // Notification lasts 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const clearNotification = () => setNotification(null);

  const handleLoginClick = () => {
    navigate("/");
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const staged = { ...formData };
    dispatch(setSignupData(staged));
    localStorage.setItem("signupData", JSON.stringify(staged));

    try {
      const result = await dispatch(sendOtp(formData.email, navigate));
      if (result) {
        console.log("OTP sent, navigating to /verify-email");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes subtle-move {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
            100% { background-position: 0% 0%; }
          }
          @keyframes popup-entry {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(40px);
  }
  60% {
    opacity: 1;
    transform: scale(1.02) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-popupEntry {
  animation: popup-entry 6s ease-out forwards;
}

@keyframes throw-letter {
  0% {
    opacity: 0;
    transform: perspective(800px) translateZ(300px) scale(3) rotateX(25deg) rotateY(10deg);
  }

  60% {
    opacity: 1;
    transform: perspective(800px) translateZ(40px) scale(1.2);
  }

  100% {
    opacity: 1;
    transform: perspective(800px) translateZ(0px) scale(1);
  }
}

.animate-throwLetter {
  display: inline-block;
  animation: throw-letter 0.8s cubic-bezier(0.25, 1.5, 0.5, 1) forwards;
}


          .logo-glow {
            filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.2));
          }
        `}
      </style>

      {/* Notification Component */}
      <Notification
        message={notification?.message}
        type={notification?.type}
        clearNotification={clearNotification}
      />

      <div className="min-h-screen flex justify-center items-center text-white p-4 font-['Inter'] bg-black">
        {showSplash && (
          <div className="fixed inset-0 flex justify-center items-center bg-black z-50">
            <div
              className="flex gap-2"
              style={{ transformStyle: "preserve-3d" }}
            >
              {"SAMVAAD".split("").map((letter, index) => (
                <span
                  key={index}
                  style={{ animationDelay: `${index * 0.2}s` }}
                  className="font-extrabold text-cyan-400 opacity-0 animate-throwLetter
           
           text-6xl        /* Mobile */
           sm:text-7xl     /* Small tablets */
           md:text-8xl     /* Tablets */
           lg:text-9xl     /* Laptops */
           xl:text-10xl     /* Large screens */
"
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row bg-black rounded-2xl shadow-2xl shadow-black/50 w-full max-w-5xl overflow-hidden min-h-[600px] border border-gray-900 backdrop-blur-sm animate-popupEntry">
          {/* Left Section (Branding) */}
          <div className="p-10 md:w-1/2 flex flex-col justify-center relative bg-[black]">
            <div className="absolute inset-0 opacity-10 bg-grid-white/[0.1] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>

            <div className="relative z-10 text-center">
              <div className="my-4 flex justify-center">
                <img
                  src={loo}
                  alt="Sanvaad Logo"
                  className="w-60 h-68 logo-glow"
                />
              </div>
              <p className="text-gray-200 text-xl mb-3 font-light">
                Your gateway to <b>secure, instant, and private</b>{" "}
                conversations.
              </p>
              <p className="text-gray-400 italic font-light text-lg">
                Start your <b className="text-cyan-400">digital dialogue</b>{" "}
                today.
              </p>
            </div>
          </div>

          {/* Right Section (Form) */}
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-[black] shadow-inner">
            <h3 className="text-3xl font-semibold mb-8 text-center text-gray-100">
              Create Account
            </h3>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-4">
                <CustomInput
                  label="First Name"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  error={errors.firstname}
                  icon={UserIcon}
                />
                <CustomInput
                  label="Last Name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  error={errors.lastname}
                  icon={UserIcon}
                />
              </div>

              <CustomInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
                error={errors.email}
                icon={MailIcon}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <CustomInput
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  error={errors.password}
                  icon={LockIcon}
                  isPassword
                  show={showPassword}
                  toggleShow={togglePasswordVisibility}
                />
                <CustomInput
                  label="Confirm Password"
                  name="confirmpassword"
                  value={formData.confirmpassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  error={errors.confirmpassword}
                  icon={LockIcon}
                  isPassword
                  show={showConfirmPassword}
                  toggleShow={toggleConfirmPasswordVisibility}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 text-gray-900 font-bold tracking-wide py-3 rounded-xl hover:bg-cyan-400 transition duration-300 mt-8 text-lg shadow-lg shadow-cyan-500/30"
              >
                Start Chatting
              </button>
            </form>

            <div className="flex items-center my-8">
              <hr className="flex-grow border-gray-700" />
              <span className="px-3 text-gray-500 text-sm font-medium">
                ALREADY REGISTERED?
              </span>
              <hr className="flex-grow border-gray-700" />
            </div>

            <button
              onClick={handleLoginClick}
              className="w-full border border-gray-700 text-cyan-400 py-3 rounded-xl hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2"
            >
              <LogInIcon size={20} /> Login to Sanvaad
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
