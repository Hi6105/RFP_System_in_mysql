const express = require("express");
const router = express.Router();

/**
 *  Setting Company Name in the session such that it can be used in vendor registration. 
 */
router.post("/", async (req, res) => {
  const { company } = req.body;
  req.session.companyName = company;
  res.json({ message: "Company Selected" });
});

module.exports = router;
