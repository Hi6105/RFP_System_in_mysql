const express = require("express");
const router = express.Router();
const pool = require("./DB");

/**
 * This route is responsible for updating the status of the category
 */
router.post("/", async (req, res) => {
  const { categoryID } = req.body;

  // Fetching the record of category corresponding to the category id.
  const [records] = await pool.query(`SELECT * FROM rfp_categories WHERE category_id = ${categoryID}`)
  
  let status;

  // Assigning the status variable according to the current status of the category
  // Since the toggle action is to set status from active to inactive and vice versa we set the satus accordingly.
  if (records[0].category_status == "active") status = "inactive";
  else status = "active";

  // Updating status in database
  await pool.query(
    `UPDATE rfp_categories
     SET category_status = '${status}'
     WHERE category_id = ${categoryID};
     `
  );
  res.send({ message: "Category status updated" });
});

module.exports = router;
