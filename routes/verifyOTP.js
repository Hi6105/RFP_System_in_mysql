const express = require("express");
const router = express.Router();
const pool = require("./DB");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;

  // Extracting the record of user if it already exists in the table
  const [record] = await pool.query(
    `SELECT otp.otp FROM otp where otp.email = '${email}'`
  );

  console.log(record,otp);

  if (record.length > 0) {
    if (record[0].otp == otp) {
      // Hashing the password
      const salt = await bcrypt.genSalt(20);
      const password = await bcrypt.hash(req.session.password, salt);

      // Creating a new company in the database
      await pool.query(
        `INSERT INTO company (company_name) VALUES ('${req.session.companyName}');`
      );

      // extracting the company_id for the newly created company
      const [companyID] = await pool.query(
        `SELECT company_id FROM company WHERE company_name = '${req.session.companyName}';`
      );

      // Saving the data for new Admin into the database.
      await pool.query(`INSERT INTO rfp_user_details (first_name, last_name, email, password, user_type, company_id) 
       VALUES ('${req.session.firstName}', '${req.session.lastName}', '${req.session.email}', '${password}', 'Super Admin', ${companyID[0].company_id});
      `);
      res.send({ message: "Signup Successful." });
    } else {
      res.send({ message: "Otp does not match" });
    }
  }
});

module.exports = router;
