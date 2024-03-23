const express = require("express");
const router = express.Router();
const pool = require("./DB");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const { password, confirmPassword } = req.body;
  const email = req.session.email;
  //validating if both the password are the same or not
  if (password !== confirmPassword)
    res.send({ message: "Both the passwords does not match." });
  else {
    // Hashing the password
    const salt = await bcrypt.genSalt(20);
    const new_password = await bcrypt.hash(password, salt);

    //Saving the new password for the user
    await pool.query(`
    UPDATE rfp_user_details
    SET password = '${new_password}'
    WHERE email = '${email}';
    `);
    res.send({ message: "Password updated." });
  }
});

module.exports = router;
