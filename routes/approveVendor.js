const express = require("express");
const router = express.Router();
const pool = require("./DB");

router.post("/", async (req, res) => {
  const { userID } = req.body;

  await pool.query(`
    UPDATE rfp_vendor_details
    SET vendor_status = 'Approved'
    WHERE user_id = ${userID} 
  `);

  res.send({ message: "Vendor approved" });
});

module.exports = router;
