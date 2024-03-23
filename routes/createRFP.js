const express = require("express");
const router = express.Router();
const { sendMail } = require("./sendMail");
const pool = require("./DB");

/**
 * This route is responsible for creating a new RFP into the system
 */
router.post("/", async (req, res) => {
  const { itemName, itemDescription, lastDate, minPrice, maxPrice, vendors, quantity } =
    req.body;

  // Saving new RFP into the database
  await pool.query(`INSERT INTO rfp_list (company_id, item_name, item_description, quantity, last_date, max_price, min_price)
  VALUES (${req.session.companyID},'${itemName}','${itemDescription}',${quantity},'${lastDate}',${maxPrice},${minPrice})
  `)

  // Extracting the rfp_no of the newly inserted RFP
  const [lastInsertedIdResult] = await pool.query('SELECT LAST_INSERT_ID() as rfpno');

  const rfp_no = lastInsertedIdResult[0].rfpno;

  //Logic to send email to all the vendors
  for (let i = 0; i < vendors.length; i++) {
    //Extracting the details of vendors to get their emails
    const [record] = await pool.query(`SELECT * FROM rfp_user_details WHERE email = '${vendors[i]}'`)
    //sending mail to the selected vendor
    const emailMessage = `
    Hello ${record[0].first_name}

    You've received a RFP.
    Your RFP number is ${rfp_no}.
    `;
    const subject = "RFP Recevied";
    sendMail(subject, vendors[i], emailMessage);

    // Mapping the RFP's for each vendor for which the rfp is created
    await pool.query(`INSERT INTO vendor_map_rfp_list (rfp_no,user_id) VALUES (${rfp_no},${record[0].user_id})`);

  }

  res.send({ message: "REF created." });
});

module.exports = router;
