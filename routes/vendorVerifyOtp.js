const express = require("express");
const router = express.Router();
const { sendMail } = require("./sendMail");
const pool = require("./DB");
const bcrypt = require("bcrypt");

/**
 * Verifying OTP for vendor registration and saving the vendor details in the database.
 */
router.post("/", async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;

  // Fetching the otp saved in the database 
  const [record] = await pool.query(`SELECT * FROM otp WHERE email = '${email}'`)


  console.log(record, email, otp);

  // Checking if the OTP for the user is in the database and the OTP received from the form is equal to the OTP from the database. 
  if (record.length > 0 && record[0].otp == otp) {
    const [company] = await pool.query(`SELECT * FROM company WHERE company_name = '${req.session.companyName}'`)
    const companyID = company[0].company_id;
    try {
      //Hashing the password

      const salt = await bcrypt.genSalt(20);
      const password = await bcrypt.hash(req.session.password, salt);

      // Creating a new user

      console.log(password);
      await pool.query(`INSERT INTO rfp_user_details (first_name, last_name, email, password, user_type, company_id)
      VALUES ('${req.session.firstName}','${req.session.latName}','${req.session.email}','${password}','Vendor',${companyID});
      `)
      
      // Extracting the User details of the newly created user for getting its user_id.
      const [newUser] = await pool.query(`SELECT * FROM rfp_user_details WHERE email = '${req.session.email}'`);

      // Extracting Category details of the category selected by the vendor to set it into the vendor details. 
      const [category] = await pool.query(`SELECT * FROM rfp_categories WHERE category_name = '${req.session.category}'`);

      // Creating the extra vendor details for the newly created vendor.
      await pool.query(`INSERT INTO rfp_vendor_details (user_id, revenue, number_of_employees, GST_no, PAN, phone_number, category_id)
      VALUES (${newUser[0].user_id},${req.session.revenue},${req.session.numberOfEmployees},'${req.session.GSTno}','${req.session.PAN}',${req.session.phoneNumber},${category[0].category_id});
      `);

      //sending mail to the user
      const emailMessage = `
      Hello ${newUser.firstName},
      Thank you for joining RFP Management.
      We'd like to confirm that your account was created successfully.`;
      const subject = "Registration Successful!";
      sendMail(subject, email, emailMessage);

      res.send({ message: "Registration Successful." });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  } else {
    res.status(400).json({
      message: "Otp does not match",
      errors: { otpError: "Otp does not match" },
    });
  }
});

module.exports = router;
