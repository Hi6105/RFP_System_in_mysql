const express = require("express");
const router = express.Router();

/**
 *  Setting Admin role before signup
 */
router.post("/", async (req, res) => {
  const { role } = req.body;
  req.session.userType = role;
  res.json({ message: "Role Selected" });
});

module.exports = router;
