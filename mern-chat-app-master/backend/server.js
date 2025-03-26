// =============================================
// ENVIRONMENT VARIABLE DIAGNOSTICS
// =============================================
const path = require('path');
const fs = require('fs');

// 1. Check .env file existence and contents
const envPath = path.join(__dirname, '.env');
console.log('\n=== ENVIRONMENT DIAGNOSTICS ===');
console.log(`Current directory: ${__dirname}`);
console.log(`Looking for .env at: ${envPath}`);
console.log(`.env exists? ${fs.existsSync(envPath) ? 'YES' : 'NO'}`);

if (fs.existsSync(envPath)) {
  console.log('.env contents:');
  console.log(fs.readFileSync(envPath, 'utf8'));
} else {
  console.log('ERROR: No .env file found in backend directory');
}

// 2. Load environment variables with explicit path
require('dotenv').config({ path: envPath });

// 3. Verify loaded variables
console.log('\n=== LOADED ENVIRONMENT VARIABLES ===');
console.log(`MONGO_URI: ${process.env.MONGO_URI ? 'SET' : 'NOT SET'}`);
console.log(`PORT: ${process.env.PORT ? process.env.PORT : 'NOT SET'}`);
console.log('=================================\n');
console.log(`.env exists? ${fs.existsSync(envPath) ? 'YES' : 'NO'}`);
console.log('.env contents:');
console.log(fs.readFileSync(envPath, 'utf8'));

// =============================================
// MAIN APPLICATION CODE
// =============================================
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const colors = require("colors");

const app = express();

// Database connection with fallback
if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set'.red.bold);
  console.log('Attempting to use fallback connection...'.yellow);
  
 
}

connectDB();

app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Deployment configuration
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*", (req, res) => 
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => res.send("API is running.."));
}

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => 
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

// Socket.io setup
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: { origin: "http://localhost:3000" }
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
