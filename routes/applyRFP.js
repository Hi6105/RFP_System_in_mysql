const express = require("express");
const router = express.Router();

/**
 * Setting the rfp_no in the session for using it in saving a new quote 
 */
router.post("/", async (req, res) => {
  const { rfpNo } = req.body;
  req.session.rfpNo = rfpNo;
  res.send("Ok");
});

module.exports = router;
