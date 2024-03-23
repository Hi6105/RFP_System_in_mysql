const express = require("express");
const router = express.Router();
const pool = require("./DB");

router.post("/", async (req, res) => {
  const { rfpNo } = req.body;

  // Fetching the RFP corresponding the RFP number recieved from call and Compnay ID of the admin.
  const [records] = await pool.query(
    `SELECT * FROM rfp_list WHERE rfp_no = ${rfpNo} AND company_id = ${req.session.companyID}`
  );

  let status;

  // Assigning the status variable according to the current status of RFP
  // Since the toggle action is to set status from CLOSE to OPEN and vice versa we set the satus accordingly.
  if (records[0].status == "OPEN") status = "CLOSE";
  else status = "OPEN";

  // Updating the new status of this RFP in the database.
  await pool.query(
    `UPDATE rfp_list
     SET status = '${status}'
     WHERE rfp_no = ${rfpNo} AND company_id = ${req.session.companyID};`
  );
  res.send({ message: "RFP status updated." });
});

module.exports = router;
