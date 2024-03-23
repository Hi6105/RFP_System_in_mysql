const express = require("express");
const router = express.Router();
const pool = require("./DB");

/**
 * This route is to check if the enter OTP is the same as generated during forgot password
 */
router.post("/", async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;

  // Extracting the OTP for the email
  const [record] = await pool.query(`SELECT * FROM otp WHERE email = '${email}'`);

  //If otp is generated for verification
  if (record.length > 0) {

    // Matches if provided OTP and OTP saved in the database are the same or not.
    if (record[0].otp == otp) {
      res.send({ message: "Otp Matched." });
    } else {
      res.send({ message: "Otp does not match" });
    }
  }
});

module.exports = router;
