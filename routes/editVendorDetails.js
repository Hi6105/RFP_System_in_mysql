const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pool = require("./DB");

// Set up Multer storage with desired options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Save uploaded files to the 'uploads' folder
  },
  filename: function (req, file, cb) {
    // Set filename to include original name and .jpg extension
    cb(
      null,
      file.originalname.replace(path.extname(file.originalname), "") +
        "-" +
        Date.now() +
        ".jpg"
    );
  },
});

// Initialize Multer upload with configured storage
const upload = multer({ storage: storage });

router.post("/", upload.single("image"), async (req, res) => {
  const {
    firstName,
    lastName,
    revenue,
    numberOfEmployees,
    GSTno,
    PAN,
    phoneNumber,
    category,
  } = req.body;

  //Email and Password validation
  let flag = false;
  let errors = {};

  if (firstName == "") {
    errors.firstNameError = `*Please enter the First Name`;
    flag = true;
  }
  if (lastName == "") {
    errors.lastNameError = `*Please enter the Last Name`;
    flag = true;
  }
  if (revenue == "") {
    errors.revenueError = `*Both the passwords must match`;
    flag = true;
  }
  if (numberOfEmployees == "") {
    errors.numberOfEmployeesError = `*Both the passwords must match`;
    flag = true;
  }
  if (GSTno == "") {
    errors.GSTerror = `*Both the passwords must match`;
    flag = true;
  }
  if (PAN == "") {
    errors.PANError = `*Both the passwords must match`;
    flag = true;
  }
  if (phoneNumber == "") {
    errors.phoneNumberError = `*Both the passwords must match`;
    flag = true;
  }
  if (category == "") {
    errors.categoryError = `*Both the passwords must match`;
    flag = true;
  }
  if (flag) {
    res.send({ message: "Error", errors: errors });
  }

  // Updating the details in users table
  await pool.query(`
  UPADTE rfp_user_details
  SET first_name = '${firstName}', last_name = '${lastName}'
  WHERE user_id = ${req.session.userID};
  `);


  // Constructing the unique name for the image file
  const uniqueFileName = req.file.originalname + `/${req.session.userID}`;


  // Extracting category data to get its id
  const [categories] = await pool.query(`SELECT * FROM rfp_categories WHERE category_name = '${category}'`);

  // Updating the details in the vendor table
  await pool.query(`
  UPADTE rfp_vendor_details
  SET revenue = ${revenue}, number_of_employees = ${numberOfEmployees}, GST_no = '${GSTno}', PAN = '${PAN}', phone_number = ${phoneNumber}, category_id = ${categories[0].category_id}, image_path = '${req.file.path}', image_name = '${uniqueFileName}'
  WHERE user_id = ${req.session.userID};
  `);

  res.send({ message: "Details updated" });
});

module.exports = router;
