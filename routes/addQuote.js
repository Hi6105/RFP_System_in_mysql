const express = require("express");
const router = express.Router();
const { sendMail } = require("./sendMail");
const pool = require("./DB");

/**
 * This route is to create a new quote by the vendor corresponding to a RFP
 */
router.post("/", async (req, res) => {
  const { vendorPrice, itemDescription, quantity, totalCost } = req.body;
  const vendorID = req.session.userID;
  const rfpNo = req.session.rfpNo;
  const companyID = req.session.companyID;

  // Extracting the Admin details who created this particular RFP to send a correspondance Email
  const [adminUserRecord] = await pool.query(`SELECT * FROM rfp_user_details WHERE company_id = ${companyID} AND user_type = 'Super Admin'`);
  
  // Extracting the vendor details from the rfp_user_details table to get its user_id
  const [vendorUserRecord] = await pool.query(`SELECT * FROM rfp_user_details WHERE user_id = ${vendorID}`);

  // Setting the email of admin
  const adminEmail = adminUserRecord[0].email;

  // Saving the new quote from the vendor into the database
  await pool.query(`INSERT INTO rfp_quotes (company_id, rfp_no, user_id, vendor_price, item_description, quantity, total_cost)
  VALUES (${companyID},${rfpNo},${vendorUserRecord[0].user_id},${vendorPrice},'${itemDescription}',${quantity},${totalCost});
  `);

  // Updating the status of vendor to applied for this particular RFP
  await pool.query(`
  UPDATE vendor_map_rfp_list
  SET applied = true
  WHERE rfp_no = ${rfpNo};
  `);

  // Sending correspondance Email
  const emailMessage = `
  Hello ${adminUserRecord.firstName},

  You've received a quote for your RFP number : ${rfpNo}
  `;
  const subject = `Quote Received against your RFP`;
  sendMail(subject, adminEmail, emailMessage);

  res.send({ message: "Quote Saved" });
});

module.exports = router;
