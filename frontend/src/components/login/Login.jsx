import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import loo from "../images/logo-removebg-preview.png";
import { useDispatch } from "react-redux";
import { loginuser } from "../services/operation/authapi";

// ---------- ICONS ----------

const MailIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LockIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const LogInIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
    <polyline points="10 17 15 12 10 7"></polyline>
    <line x1="15" y1="12" x2="3" y2="12"></line>
  </svg>
);

// ---------- INPUT FIELD ----------
const CustomInput = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
}) => (
  <div className="relative w-full md:mb-6 mb-2">
    <label className="block mb-2 md:text-xl text-lg  text-gray-200">
      {label} <span className="text-red-400">*</span>
    </label>
    <div className="relative flex items-center border-b-2 border-gray-400 focus-within:border-cyan-400 transition-all duration-300 rounded-t-md">
      {Icon && (
        <div className="md:p-3 p-1 text-gray-300">
          <Icon size={20} />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full md:p-3 p-2 bg-transparent text-white placeholder-gray-400 focus:outline-none"
        required
      />
    </div>
  </div>
);

// ---------- MAIN LOGIN ----------
const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => setShowSplash(false), 3000); // 1.8 seconds
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("Login Data:", formData);
    dispatch(loginuser(formData.email, formData.password, navigate));
  };

  const handleSignupClick = () => navigate("/signup");

  return (
    <>
      <style>{`
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
      `}</style>

      <div className="min-h-screen  flex justify-center items-center text-white p-4 font-['Inter'] bg-black ">
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

        <div
          className={`flex flex-col md:flex-row bg-[black] rounded-2xl shadow-2xl shadow-black/50 
  w-full max-w-5xl overflow-hidden md:min-h-[720px] border border-gray-900 backdrop-blur-sm 
  animate-popupEntry transition-opacity duration-700 
  ${showSplash ? "opacity-0" : "opacity-100"}`}
        >
          {/* LEFT SIDE */}
          <div className="md:p-10 md:w-1/2 flex flex-col justify-center relative overflow-hidden bg-[black] ">
            <div className="relative z-10 text-center">
              <div className="md:my-4 flex justify-center">
                <img
                  src={loo}
                  alt="Sanvaad Logo"
                  className="md:w-60 md:h-68 h-30 w-32 logo-glow"
                />
              </div>

              <p className="text-gray-200 md:text-2xl text-xl mb-3 font-light">
                Welcome back to your{" "}
                <strong className="text-cyan-400">secure chat</strong> space.
              </p>
              <p className="text-gray-400 italic font-light text-base md:text-lg">
                Continue your{" "}
                <strong className="text-cyan-400">digital dialogue</strong>.
              </p>
            </div>
          </div>












          {/* RIGHT SIDE */}
          <div
            className="p-4 md:p-12 md:w-1/2 flex flex-col justify-center relative bg-black "
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(30,30,30,0.1) 0%, transparent 80%)",
            }}
          >
            <h3 className="md:text-3xl text-2xl font-medium mb-8 text-center text-gray-100">
              Login to Samvaad
            </h3>

            <form onSubmit={handleSubmit} className="md:space-y-6 space-y-3">
              <CustomInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                icon={MailIcon}
              />

              <CustomInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={LockIcon}
              />

              <button
                type="submit"
                className="w-full bg-cyan-500 text-gray-900 font-bold tracking-wide py-3 rounded-xl hover:bg-cyan-400 transition duration-300 md:mt-8 mt-4 text-lg shadow-lg shadow-cyan-500/30"
              >
                Start Chatting
              </button>
            </form>

            <div className="flex items-center my-4 md:my-8">
              <hr className="flex-grow border-gray-700" />
              <span className="px-3 text-gray-500 text-sm font-medium">
                NOT REGISTERED?
              </span>
              <hr className="flex-grow border-gray-700" />
            </div>

            <button
              onClick={handleSignupClick}
              className="w-full border border-gray-700 text-cyan-400 py-3 rounded-xl hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2"
            >
              <LogInIcon size={20} className="text-cyan-400" /> Create a New
              Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
