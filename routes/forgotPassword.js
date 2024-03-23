const express = require("express");
const router = express.Router();
const { saveOtpToDatabase, sendMail, generateOtp } = require("./sendMail");
const pool = require("./DB");

router.post("/", async (req, res) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validation for email
  if (!emailRegex.test(email)) {
    res.send({ message: "Invalid email address" });
  }

  // Extracting details if the user with the provided email
  const [userRecord] = await pool.query(`SELECT * FROM rfp_user_details WHERE email = '${email}'`);

  // checking if the user exists or not
  if (userRecord.length > 0) {
    //Generating an OTP
    const otp = generateOtp();
    //saving otp into DB
    saveOtpToDatabase(email, otp);

    //sending mail to the receiver
    const emailMessage = `Your OTP for email verification is: ${otp}`;
    const subject = "OTP for Email Verification";
    sendMail(subject, email, emailMessage);
    req.session.email = email;
    res.send({ message: "Otp sent." });
  } else {
    res.send({ message: "User does not exists." });
  }
});

module.exports = router;
