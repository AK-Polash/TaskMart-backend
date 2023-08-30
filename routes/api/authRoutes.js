const express = require("express");
const {
  signUpController,
  userVerificationController,
  loginController,
  forgotPasswordController,
  matchOtpController,
  resetPasswordController,
  allUserController,
} = require("../../controllers/authControllers");
const _ = express.Router();

_.post("/signup", signUpController);
_.post("/userVerification", userVerificationController);
_.post("/login", loginController);
_.post("/forgotPassword", forgotPasswordController);
_.post("/matchOtp", matchOtpController);
_.post("/resetPassword", resetPasswordController);
_.get("/allUser", allUserController);

module.exports = _;
