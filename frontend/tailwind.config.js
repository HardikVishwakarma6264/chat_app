// /** @type {import('tailwindcss').Config} */


// module.exports = {
//    content: ["./src/**/*.{js,jsx,ts,tsx}"],
//   theme: {
//     extend: {

//       keyframes: {
//       slideIn: {
//         '0%': { transform: 'translateX(-100%)' },
//         '100%': { transform: 'translateX(0)' },
//       },
//     },
//     animation: {
//       slideIn: 'slideIn 0.3s ease-out',
//     },

//       colors: {
//         // WhatsApp Dark Mode Colors
//         'whatsapp-bg-primary': '#0b141a',      // Main background (darkest)
//         'whatsapp-header-bg': '#1f2c34',       // Sidebar/Chat Header background
//         'whatsapp-search-bg': '#111b21',       // Search input background
//         'whatsapp-border-default': '#2a3942',  // Separator lines
//         'whatsapp-chat-bg': '#0e1621',         // Chat message area background
//         'whatsapp-footer-bg': '#1f2c34',       // Message input footer
//         'whatsapp-input-bg': '#2a3942',        // Message input field
//         'whatsapp-active-chat': '#2a3942',     // Selected chat highlight
//         'whatsapp-hover-chat': '#1f2c34',      // Chat list item hover
//         'whatsapp-received-bubble': '#1f2c34', // Incoming message bubble
//         'whatsapp-sent-bubble': '#005c4b',     // Outgoing message bubble (Green)
//         'whatsapp-teal': '#00a884',            // Teal accents/unread count
//       },
//     },
//   },
//   plugins: [require("daisyui")], // DaisyUI plugin
//   // Optional: DaisyUI themes
//   daisyui: {
//     themes: ["light", "dark"], // ya custom theme bana sakte ho
//   },
// };




/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",  // ⭐️ सबसे ज़रूरी LINE ⭐️

  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out",
      },

      colors: {
        "whatsapp-bg-primary": "#0b141a",
        "whatsapp-header-bg": "#1f2c34",
        "whatsapp-search-bg": "#111b21",
        "whatsapp-border-default": "#2a3942",
        "whatsapp-chat-bg": "#0e1621",
        "whatsapp-footer-bg": "#1f2c34",
        "whatsapp-input-bg": "#2a3942",
        "whatsapp-active-chat": "#2a3942",
        "whatsapp-hover-chat": "#1f2c34",
        "whatsapp-received-bubble": "#1f2c34",
        "whatsapp-sent-bubble": "#005c4b",
        "whatsapp-teal": "#00a884",
      },
    },
  },

  plugins: [require("daisyui")],

  daisyui: {
    themes: ["light", "dark"], 
  },
};
