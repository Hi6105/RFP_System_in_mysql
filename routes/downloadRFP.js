const express = require("express");
const router = express.Router();
const pool = require('./DB');

router.use("/", async (req, res) => {
  try {

    // Fetching all the RFP's for a company
    const [RFPList] = await pool.query(`SELECT * FROM rfp_list WHERE company_id = ${req.session.companyID}`);

    // Setting the heading for each column in Excel file
    const headers = [
      "RFP No.",
      "RFP Title",
      "RFP Last Date",
      "Min Amount",
      "Max Amount",
      "Status",
    ];

    // Map each RFP object to CSV format
    let csvData = RFPList.map((rfp) => {
      return `${rfp.rfp_no},${rfp.item_name},${rfp.last_date.toDateString()},${
        rfp.min_price
      },${rfp.max_price},${rfp.status}`;
    });

    // Join headers and CSV data
    csvData = [headers.join(","), ...csvData].join("\n");

    res.setHeader("Content-disposition", "attachment; filename=RFP_List.csv");
    res.set("Content-Type", "text/csv");
    res.status(200).send(csvData);
  } catch (error) {
    console.error("Error occurred while downloading RFP list:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
