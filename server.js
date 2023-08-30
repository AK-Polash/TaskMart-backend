require("dotenv").config();
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const server = require("http").createServer(app);
const dbConfig = require("./config/dbConfig");
const cors = require("cors");
const _ = require("./routes");

const port = process.env.PORT;

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173/signup"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(socket);
});

// DB Connection:
dbConfig();

// Middleware:
app.use(express.json());
app.use(cors());

app.use(_);
server.listen(port, () => console.log(`PORT IS RUNNING ON ${port}`));
