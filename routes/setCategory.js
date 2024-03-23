const express = require("express");
const router = express.Router();

//Setting category in session to extract vendor belonging to this category in RFP creation.
router.post("/", async (req, res) => {
  const { category } = req.body;
  req.session.category = category;
  res.send({ message: "Category selected." });
});

module.exports = router;
