const emailSender = require("../helpers/emailSender");
const otpTemplate = require("../emailTemplates/otpTemplate");
const emailValidator = require("../helpers/emailValidator");
const passwordValidator = require("../helpers/passwordValidator");
const {
  emptySpaceValidation,
  noSpaceValidation,
} = require("../helpers/spaceValidator");
const User = require("../models/userModel");
const aleaRNGFactory = require("number-generator/lib/aleaRNGFactory");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenCreator = require("../helpers/tokenCreator");
const verificationTemplate = require("../emailTemplates/verificationTeplate");
const { idValidator } = require("../helpers/idValidator");

const signUpController = async (req, res) => {
  const { userName, email, password } = req.body;

  if (emptySpaceValidation(res, userName, "userName")) {
    return;
  } else if (emailValidator(res, email, "email")) {
    return;
  } else if (passwordValidator(res, password, "password")) {
    return;
  } else if (password.length < 8) {
    return res.send({
      error: "Password length must be over 7 char",
      errorField: "password",
    });
  }

  try {
    const existingUser = await User.find({ email });
    if (existingUser.length > 0) {
      return res.send({
        error: "User already exist in this email",
        errorField: "email",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      email,
      password: hash,
    });

    const token = tokenCreator({ email: newUser.email }, "secret", "1d");
    await newUser.save();

    emailSender(
      newUser.email,
      "Account Verification",
      verificationTemplate(token)
    );

    return res.send({
      message: "Registration successfull verify your email",
      data: {
        userName,
        email,
      },
    });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

const userVerificationController = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) return res.send({ error: "Cridential error" });
    const decodedToken = jwt.verify(token, "secret");
    const { email } = decodedToken;

    const user = await User.findOneAndUpdate(
      { email },
      { verified: true },
      { new: true }
    );

    if (!user) {
      return res.send({ error: "Occured an error while verifying the user" });
    }

    return res.send({ message: "Account verified successfully" });
  } catch (error) {
    return res.send({ error: "Internal server error" });
  }
};

const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (emailValidator(res, email, "email")) {
    return;
  } else if (passwordValidator(res, password, "password")) {
    return;
  }

  try {
    const existingUser = await User.find({ email });
    if (!existingUser.length > 0) {
      return res.send({ error: "User not found", errorField: "email" });
    }

    const match = await bcrypt.compare(password, existingUser[0].password);
    if (!match) {
      return res.send({ error: "Cridential error", errorField: "password" });
    }

    return res.send({
      message: "Login successful",
      loginData: {
        email,
        userName: existingUser[0].userName,
        userId: existingUser[0]._id,
      },
    });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

const forgotPasswordController = async (req, res) => {
  const { forgotPassword } = req.body;
  if (emailValidator(res, forgotPassword, "forgotPassword")) return;

  try {
    const { uInt32 } = aleaRNGFactory(Date.now());
    const randomOtp = uInt32().toString().substring(0, 4);

    const updatedUserData = await User.findOneAndUpdate(
      { email: forgotPassword },
      { $set: { forgotPasswordOTP: randomOtp } },
      { new: true }
    );

    if (!updatedUserData) {
      return res.send({
        error: "User not found",
        errorField: "forgotPassword",
      });
    }

    emailSender(forgotPassword, "Forgot Password?", otpTemplate(randomOtp));

    return res.send({ message: "An OTP code sent to your email address" });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

const matchOtpController = async (req, res) => {
  const { otp, forgotPassword } = req.body;

  if (noSpaceValidation(res, otp, "otp")) {
    return;
  } else if (emailValidator(res, forgotPassword, "otp")) {
    return;
  }

  try {
    const existingUser = await User.find({ email: forgotPassword });
    if (!existingUser.length > 0) {
      return res.send({ error: "User not found", errorField: "otp" });
    }

    const cloudOtp = existingUser[0].forgotPasswordOTP;
    if (cloudOtp !== otp) {
      return res.send({ error: "OTP code does not match", errorField: "otp" });
    }

    return res.send({ message: "OTP code matched successfully" });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

const resetPasswordController = async (req, res) => {
  const { email, newPassword } = req.body;

  if (emailValidator(res, email, "resetPassword")) {
    return;
  } else if (passwordValidator(res, newPassword, "resetPassword")) {
    return;
  } else if (newPassword.length < 8) {
    return res.send({
      error: "Password length must be at lest 8 character",
      errorField: "resetPassword",
    });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const updatedUserData = await User.findOneAndUpdate(
      { email },
      { $set: { password: hash }, $unset: { forgotPasswordOTP: "" } },
      { new: true }
    );

    if (!updatedUserData) {
      return res.send({
        error: "User can't be updated",
        errorField: "resetPassword",
      });
    }

    return res.send({ message: "Password reset successfully" });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

const allUserController = async (req, res) => {
  const { user } = req.headers;
  if (idValidator(res, user)) return;

  try {
    const requestingUser = await User.findOne({ _id: user });
    if (!requestingUser) return res.send({ error: "You are not authorized" });

    const allUser = await User.find({}).select({ __v: 0 });
    if (!allUser.length > 0) return res.send({ error: "No user found" });

    return res.send({ users: allUser });
  } catch (err) {
    console.log(err);
    return res.send({ error: "Internal server error" });
  }
};

module.exports = {
  signUpController,
  userVerificationController,
  loginController,
  forgotPasswordController,
  matchOtpController,
  resetPasswordController,
  allUserController,
};
