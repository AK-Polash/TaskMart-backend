const nodemailer = require("nodemailer");

const emailSender = async (mailTo, ...rest) => {
  const [subject, template] = rest;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "polashk199@gmail.com",
        pass: "omggidpizbjreuyp",
      },
    });

    await transporter.sendMail({
      from: "polashk199@gmail.com",
      to: mailTo,
      subject: subject,
      html: template,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = emailSender;
