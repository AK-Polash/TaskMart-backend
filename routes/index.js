require("dotenv").config();
const express = require("express");
const apiRoutes = require("./api");
const _ = express.Router();

const api = process.env.BASE_URL;

_.use(api, apiRoutes);
_.get("/", (req, res) => res.send({ error: "No api found on this route" }));

module.exports = _;
