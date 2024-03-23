const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const router = express.Router();
const pool = require("./DB");

router.post('/', async (req, res) => {
    const {rfpNo} = req.body;

    // Fetching the RFP corresponding the RFP number recieved from call and Compnay ID of the admin.
    const [rfpDetails] = await pool.query(
        `SELECT * FROM rfp_list WHERE rfp_no = ${rfpNo} AND company_id = ${req.session.companyID}`
      ); 

    if (rfpDetails.length == 0) {
        // If no RFP details found, return an error response
        return res.status(404).send('RFP details not found');
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    const pdfFileName = `RFP_${rfpNo}.pdf`;

    // Pipe the PDF content to a writable stream
    const stream = fs.createWriteStream(pdfFileName);
    doc.pipe(stream);

    // Adding RFP details to the PDF document
    doc.fontSize(16).text(`RFP Details for RFP No. ${rfpNo}`, { align: 'center' });
    doc.text('----------------------------------------------',{align:'center'});
    doc.fontSize(12).text(`RFP Item Name: ${rfpDetails[0].item_name}`);
    doc.fontSize(12).text(`RFP Item Description: ${rfpDetails[0].item_description}`);
    doc.fontSize(12).text(`RFP Quantity: ${rfpDetails[0].quantity}`);
    doc.fontSize(12).text(`RFP Last Date: ${rfpDetails[0].last_date.toDateString()}`);
    doc.fontSize(12).text(`Min Amount: ${rfpDetails[0].min_price}`);
    doc.fontSize(12).text(`Max Amount: ${rfpDetails[0].max_price}`);
    doc.fontSize(12).text(`Status: ${rfpDetails[0].status}`);

    // Finalize the PDF document
    doc.end();

    // Send the generated PDF file to the client
    stream.on('finish', () => {
        res.download(pdfFileName, pdfFileName, (err) => {
            if (err) {
                console.error('Error downloading PDF:', err);
                res.status(500).end();
            } else {
                // Remove the temporary PDF file after download
                fs.unlinkSync(pdfFileName);
            }
        });
    });
});

module.exports = router;
