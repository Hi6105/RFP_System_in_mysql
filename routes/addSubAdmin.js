const express = require("express");
const router = express.Router();
const { sendMail } = require("./sendMail");
const pool = require("./DB");
const bcrypt = require("bcrypt");

/**
 * This route is responsible for creating sub-admins in a company (Accounts, Procurement Manager)
 */
router.post("/", async (req, res) => {
  const { firstName, lastName, email, role } = req.body;

  //Email and Password validation
  let flag = false;
  let errors = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (firstName == "") {
    errors.firstNameError = `*Please enter the First Name`;
    flag = true;
  }
  if (lastName == "") {
    errors.lastNameError = `*Please enter the Last Name`;
    flag = true;
  }
  if (!emailRegex.test(email)) {
    errors.emailError = `*Please enter the email in correct format i.e. "abc@gmail.com"`;
    flag = true;
  }
  if (role == "") {
    errors.roleError = `*Both the passwords must match`;
    flag = true;
  }

  // If one of the validation from the above fails errors are send accordingly to the frontend.
  if (flag) {
    res.status(400).json({ message: "Error", errors: errors });
  }

  //Check if user already exists.
  const [record] = await pool.query(`SELECT * FROM rfp_user_details WHERE email = '${email}'`);

  // If exists error message is sent.
  if (record.length > 0) {
    res.status(400)({
      message: "User with this email already exists.",
      errors: { emailError: "*User with this email already exists." },
    });
  }

  // Extracting company details from the company name to get its company id
  const [company] = await pool.query(`SELECT * FROM company WHERE company_name = '${req.session.companyName}'`)
  
  /**
   * Generating a random password for the sub-admin
   */
  const generatePassword = () => {
    const initialLetter = "Velocity";
    const randomLetters = generateRandomLetters(8); // Adjust the length of random letters as needed
    return initialLetter + randomLetters;
  };

  const generateRandomLetters = (length) => {
    // Declaring a set of charaters in a string
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
      // Appending the random into the result
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  // Example usage
  let password = generatePassword();
  //Hashing the password

  const salt = await bcrypt.genSalt(20);
  password = await bcrypt.hash(password, salt);

  /**
   * Saving sub admin to the database.
   */

  await pool.query(`INSERT INTO rfp_user_details (first_name, last_name, email, password, user_type, company_id) 
  VALUES ('${firstName}','${lastName}','${email}','${password}','${role}',${req.session.companyID})`)


  //sending mail to the receiver
  const emailMessage = `
  Hi ${firstName},

  You have been added as the ${role} for ${req.session.companyName}.

  Your credentials for login are -

  Email - ${email}
  Password - ${password}
  `;
  const subject = `Assigning access role for ${role}.`;
  sendMail(subject, email, emailMessage);
  res.send({ message: "Otp sent." });
});

module.exports = router;
