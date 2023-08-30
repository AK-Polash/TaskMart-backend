require("dotenv").config();
const mongoose = require("mongoose");

const dbConfig = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => console.log("Database Connected"))
    .catch((err) => console.log(err));
};

module.exports = dbConfig;
