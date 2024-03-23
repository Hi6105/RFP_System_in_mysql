const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("./DB");

/**
 * Route to check login credentials of user.
 */
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  /**
   * Validating received data.
  */ 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errors = {};

  // Checking if either the email is not empty and follow the regex format.
  if (email === "" || !emailRegex.test(email)) {
    errors.emailError =
      email === ""
        ? "*Please enter the email"
        : "*Please enter the email in correct format i.e. 'abc@gmail.com'";
  }

  // Checking if the password is not empty.
  if (password === "") {
    errors.passwordError = "*Please enter the password";
  }

  // If any of the above check fails error response will be send.
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation error", errors });
  }

  /**
   * Verifying the credentials of user
   */
  try {

    // Retriving the details of the user.
    const [record] = await pool.query(`SELECT * FROM rfp_user_details WHERE rfp_user_details.email = '${email}'`);

    // Checking if the user with this particular email exists or not.
    if (record.length == 0) {
      // If user does not exists in the database error will be send.
      return res.status(404).json({
        message: "User does not exist",
        errors: { emailError: "Email does not exist" },
      });
    }

    // Checking if the users password matches with the entered password.
    const isCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isCorrect) {
      // If not error message is send.
      return res.status(401).json({
        message: "Password is wrong",
        errors: { passwordError: "Password is wrong" },
      });
    }

    // Storing user id and type into variables such that we can use them in future.
    let userType, userID;
    userID = record[0].user_id;
    userType = record[0].user_type;


    // Checking if the user is vendor is he approved by admin or not.
    if (userType === "Vendor") {
      const [vendorRecord] = await pool.query(`SELECT * FROM rfp_vendor_details WHERE user_id = ${userID}`);
      console.log(vendorRecord);

      //Checking the status of the vendor.
      if (!vendorRecord || vendorRecord[0].vendor_status === "Rejected") {
        return res.status(403).json({
          message: "Vendor is not approved by admin",
          errors: { emailError: "Not approved by admin" },
        });
      }
    }

    // Storing the data of user in session to redirect them further in the "/Home" route. 
    req.session.userID = userID;
    req.session.userType = userType;
    req.session.companyID = record[0].company_id;

    return res.json({ message: "User Authenticated" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
