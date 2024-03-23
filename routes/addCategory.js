const express = require("express");
const router = express.Router();
const pool = require("./DB");

/**
 *  Adding a new category
 */
router.post("/", async (req, res) => {
  const { category } = req.body;

  // Inserting a new category into rfp_categories table.
  await pool.query(`INSERT INTO rfp_categories (company_id, category_name) VALUES (${req.session.companyID},'${category}')`);

  res.send({ message: "Category Added" });
});

module.exports = router;
