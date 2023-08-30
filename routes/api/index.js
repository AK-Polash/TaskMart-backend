const express = require("express");
const _ = express.Router();
const authRoutes = require("./authRoutes");
const taskRoutes = require("./taskRoutes");

_.use("/auth", authRoutes);
_.use("/task", taskRoutes);
_.get("/auth", (req, res) => res.send({ error: "No api found on this route" }));

module.exports = _;
