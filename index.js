const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const connectDatabase = require("./config/db");
const socketIO = require("socket.io");
const http = require("http");
const compression = require("compression");
const cronJob = require("./helpers/cronJob");

connectDatabase();

dotenv.config();

const server = http.createServer(app);

// Configure socket.io with CORS options
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

app.use(cors({ origin: "http://localhost:18000" }));
app.use(express.json());
app.use(compression());

// Attach io to the app instance so it can be accessed in other modules
app.set("io", io);

// WebSocket connection
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Define routes after setting `io`
const todoRouter = require("./routes/Todo");
app.use(todoRouter);

app.use(
  compression({
    limit: "10mb",
  })
);

cronJob();

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server listening on Port ${PORT}`);
});

module.exports = server;
