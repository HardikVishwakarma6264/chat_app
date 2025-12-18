const express = require("express");
const http = require("http");
const os = require("os");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileupload = require("express-fileupload");
const dotenv = require("dotenv");

const database = require("./config/database");
const cloudinaryConnect = require("./config/cloudinary");
const userrouter = require("./routes/Userr");
const messrouter = require("./routes/Mess");
const friendroute = require("./routes/Friend");
const { initSocket } = require("./socket/socket");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4001;

// 🧩 Connect Database + Cloudinary
database.connect();
cloudinaryConnect();

// Middleware
app.use(express.json());
app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: [
      "https://chat-app-flax-psi-32.vercel.app",
      "https://chat-app-git-main-hardik-vishwakarmas-projects.vercel.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());




app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: os.tmpdir(),
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

// Routes
app.use("/api/v1/auth", userrouter);
app.use("/api/v1/mess", messrouter);
app.use("/api/v1/friend", friendroute);

// Default route
app.get("/", (req, res) =>
  res.json({ success: true, message: "Server running ✅" })
);

// 🌐 Create HTTP + Socket server
const server = http.createServer(app);
const io = initSocket(server);

// Export the io instance separately (no circular import!)
module.exports = { io };

// 🚀 Start server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
