require("dotenv").config();
const express = require("express");
const app = express();
require("./routes/DB");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const pool = require("./routes/DB");
const MySQLStore = require("express-mysql-session")(session);

// MySQL connection options
const dbOptions = {
  host: process.env.SERVER,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
};

const sessionStore = new MySQLStore(dbOptions);

app.use(express.static(path.join(__dirname, "public")));

// Configuring express-session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

require("./middleware/auth");
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

const signup = require("./routes/signup");
const addCategory = require("./routes/addCategory");
const approveVendor = require("./routes/approveVendor");
const login = require("./routes/login");
const verifyOtp = require("./routes/verifyOTP");
const addVendor = require("./routes/addVendor");
const vendorVerifyOtp = require("./routes/vendorVerifyOtp");
const setCategory = require("./routes/setCategory");
const createRFP = require("./routes/createRFP");
const applyRFP = require("./routes/applyRFP");
const addQuote = require("./routes/addQuote");
const forgotPassword = require("./routes/forgotPassword");
const verifyOTPreset = require("./routes/verifyOTPreset");
const resetPassword = require("./routes/resetPassword");
const categoryStatusUpdate = require("./routes/categoryStatusUpdate");
const rfpStatusUpdate = require("./routes/rfpStatusUpdate");
const editVendorDetails = require("./routes/editVendorDetails");
const downloadRFPList = require("./routes/downloadRFP");
const uploadCategory = require("./routes/uploadCategory");
const setAdminRole = require("./routes/setAdminRole");
const addSubAdmin = require("./routes/addSubAdmin");
const setCompany = require("./routes/setCompany");
const downloadSampleCategories = require("./routes/downloadSampleCategory");
const downloadRfpPdf = require("./routes/downloadRfpPdf");

app.use("/download-pdf", downloadRfpPdf);
app.use("/downloadSampleCategories", downloadSampleCategories);
app.use("/setCompany", setCompany);
app.use("/addSubAdmin", addSubAdmin);
app.use("/setAdminRole", setAdminRole);
app.use("/uploadCategory", uploadCategory);
app.use("/downloadRFPList", downloadRFPList);
app.use("/editVendorDetails", editVendorDetails);
app.use("/rfpStatusUpdate", rfpStatusUpdate);
app.use("/resetPasswordRoute", resetPassword);
app.use("/verifyOTPreset", verifyOTPreset);
app.use("/forgotPasswordRoute", forgotPassword);
app.use("/createRFP", createRFP);
app.use("/vendorVerifyOtp", vendorVerifyOtp);
app.use("/addVendor", addVendor);
app.use("/verifyOtp", verifyOtp);
app.use("/login", login);
app.use("/setCategory", setCategory);
app.use("/applyRFP", applyRFP);
app.use("/addQuote", addQuote);
app.use("/categoryStatusUpdate", categoryStatusUpdate);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/afterAuth",
    failureRedirect: "/login",
  })
);

app.get("/afterAuth", (req, res) => {
  console.log(req.user.user.firstName);
  if (req.user.user.userType) {
    req.session.userType = req.user.user.userType;
    req.session.userID = req.user.user.userID;
    req.session.companyID = req.user.user.companyID;
    res.redirect("/Home");
  } else {
    console.log(req.user);
    req.session.firstName = req.user.user.firstName;
    req.session.lastName = req.user.user.lastName;
    req.session.email = req.user.user.email;
    res.redirect("/selectCompany");
  }
});

app.use("/assignRoles", (req, res) => {
  const userType = req.session.userType;
  res.render("admin/assignRole", { userType });
});

app.use("/selectCompany", async (req, res) => {
  const [companies] = await pool.query(`SELECT * FROM company;`);
  res.render("vendor/selectCompany", { companies });
});

app.use("/accessRoles", async (req, res) => {
  const userType = req.session.userType;
  if (userType == "Super Admin") {
    const [subAdmins] = await pool.query(
      `SELECT * FROM rfp_user_details WHERE company_id = ${req.session.companyID} AND user_type IN ('Accounts', 'Procurement Manager')`
    );

    console.log(subAdmins);
    let serialNumber = 1;
    res.render("admin/accessRole", { subAdmins, serialNumber, userType });
  } else res.status(404).send("Page not Found");
});

app.use("/selectAdminRole", (req, res) => {
  res.render("selectAdminRole");
});

app.use("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).send("logout success");
});

app.use("/editDetails", async (req, res) => {
  const userType = req.session.userType;
  if (userType == "vendor") {
    let [documents] = await pool.query(
      `SELECT * FROM rfp_categories WHERE category_status = 'active';`
    );
    res.render("vendor/editDetails", { documents, userType });
  } else res.status(404).send("Page not found");
});

app.use("/create_RFP", async (req, res) => {
  const userType = req.session.userType;
  if (userType == "Super Admin" || userType == "Procurement Manager") {
    let vendors;
    [category] = await pool.query(
      `SELECT * FROM rfp_categories WHERE category_name = '${req.session.category}'`
    );
    [vendors] = await pool.query(
      `SELECT * FROM rfp_vendor_details WHERE category_id = '${category[0].category_id}'`
    );
    let extractedData = [];
    for (let i = 0; i < vendors.length; i++) {
      const userID = vendors[i].user_id;
      const [vendor] = await pool.query(
        `SELECT * FROM rfp_user_details WHERE user_id = ${userID}`
      );
      extractedData.push({
        email: vendor[0].email,
        name: vendor[0].first_name,
      });
    }
    req.session.extractedData = extractedData;
    res.render("admin/create_RFP", { extractedData, userType });
  } else {
    res.status(404).send("Page not found");
  }
});

app.use("/createQuote", (req, res) => {
  const userType = req.session.userType;
  if (userType == "Vendor") res.render("vendor/createQuote", { userType });
  else res.status(404).send("Page not found");
});

app.use("/Vendor_RFP_List", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // Default limit to 10 items per page

  try {
    const [record] = await pool.query(
      `SELECT COUNT(*) AS totalCount FROM vendor_map_rfp_list WHERE user_id = ${req.session.userID}`
    );
    console.log(record);
    const totalCount = record[0].totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    let skip = (page - 1) * limit;
    if (skip < 0) skip = 0;

    const userType = req.session.userType;

    if (userType == "Vendor") {
      let Vendor_RFP_List;
      [Vendor_RFP_List] = await pool.query(
        `SELECT rfp_list.*,vendor_map_rfp_list.user_id,vendor_map_rfp_list.applied FROM vendor_map_rfp_list JOIN rfp_list ON vendor_map_rfp_list.rfp_no = rfp_list.rfp_no WHERE vendor_map_rfp_list.user_id = ${req.session.userID} LIMIT ${limit} OFFSET ${skip};`
      );

      console.log(Vendor_RFP_List);
      res.render("vendor/Vendor_RFP_List", {
        Vendor_RFP_List,
        page,
        totalPages,
        userType,
      });
    } else {
      res.status(404).send("Page not found");
    }
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/Home", async (req, res) => {
  const userType = req.session.userType;
  if (
    userType == "Super Admin" ||
    userType == "Accounts" ||
    userType == "Procurement Manager"
  )
    res.render("admin/Dashboard", { userType });
  else if (userType == "Vendor") {
    const [vendor] = await pool.query(
      `SELECT * FROM rfp_vendor_details WHERE user_id = ${req.session.userID};`
    );
    let formattedPath = "";
    if (vendor[0].image) {
      const path = vendor.image.path;
      formattedPath = "public/" + path.replace(/\\/g, "/");
      console.log(path, formattedPath);
    }
    res.render("vendor/dashboard", { formattedPath, userType });
  } else res.status(404).send("Page not found");
});

app.use("/RFP_select_category", async (req, res) => {
  const userType = req.session.userType;
  if (userType == "Super Admin" || userType == "Procurement Manager") {
    const [documents] = await pool.query(
      `SELECT * FROM rfp_categories WHERE company_id = ${req.session.companyID} AND category_status = 'active'`
    );

    res.render("admin/RFP_select_category", { documents, userType });
  } else res.status(404).send("Page not found");
});

app.use("/RFP_List", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // Default limit to 3 items per page

  try {
    const companyID = req.session.companyID;
    const [record] = await pool.query(
      `SELECT COUNT(*) AS totalCount FROM rfp_list WHERE company_id = ${companyID}`
    );
    const totalCount = record[0].totalCount;
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    let skip = (page - 1) * limit;
    if (skip < 0) skip = 0;

    const userType = req.session.userType;
    if (
      userType == "Super Admin" ||
      userType == "Accounts" ||
      userType == "Procurement Manager"
    ) {
      const [RFPList] = await pool.query(`
    SELECT * 
    FROM rfp_list
    WHERE company_id = ${companyID}
    LIMIT ${limit} OFFSET ${skip};
    `);

      res.render("admin/RFP_List", { RFPList, page, totalPages, userType });
    } else res.status(404).send("Page not found");
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/approveVendor", approveVendor);
app.use("/addCategory", (req, res) => {
  const userType = req.session.userType;
  if (userType == "Super Admin" || userType == "Procurement Manager") {
    res.render("admin/addcategory", { userType });
  } else res.status(404).send("Page not found");
});

app.use("/RFP_Quotes", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // limit to 3 items per page

  try {
    const companyID = req.session.companyID;
    const [record] = await pool.query(
      `SELECT COUNT(*) AS totalCount FROM rfp_quotes WHERE company_id = ${companyID}`
    );
    const totalCount = record[0].totalCount;

    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    let skip = (page - 1) * limit;
    if (skip < 0) skip = 0;

    const userType = req.session.userType;
    if (
      userType == "Super Admin" ||
      userType == "Accounts" ||
      userType == "Procurement Manager"
    ) {
      let data = [];
      const [RFP_Quotes] = await pool.query(`
    SELECT * 
    FROM rfp_quotes
    WHERE company_id = ${companyID}
    LIMIT ${limit} OFFSET ${skip};
    `);

      for (let i = 0; i < RFP_Quotes.length; i++) {
        const [RFP] = await pool.query(
          `SELECT * FROM rfp_list WHERE rfp_no = ${RFP_Quotes[i].rfp_no}`
        );
        data.push({
          rfpNo: RFP_Quotes[i].rfp_no,
          itemName: RFP[0].item_name,
          vendorID: RFP_Quotes[i].user_id,
          vendorPrice: RFP_Quotes[i].vendor_price,
          quantity: RFP_Quotes[i].quantity,
          totalCost: RFP_Quotes[i].total_cost,
        });
      }

      res.render("admin/RFP_quotes", { data, page, totalPages, userType });
    } else res.status(404).send("Page not found");
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/addCategoryRequest", addCategory);

app.use("/signupPage", async (req, res) => {
  res.render("signup");
});

app.use("/adminLayout", (req, res) => {
  if (req.session.userType == "admin") res.render("layouts/adminLayout");
  else res.status(404).send("Page not found");
});
app.use("/admin", (req, res) => {
  if (req.session.userType == "admin") res.render("admin/Dashboard");
  else res.status(404).send("Page not found");
});

app.use("/categories", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // Default limit to 3 items per page

  try {
    const [record] = await pool.query(
      `SELECT COUNT(*) AS totalCount FROM rfp_categories`
    );
    const totalCount = record[0].totalCount;
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1); // Ensure at least one page

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    // Declaring this variable
    const serialNumber = 1;
    let skip = (page - 1) * limit;
    if (skip < 0) skip = 0;
    const userType = req.session.userType;
    if (
      userType == "Super Admin" ||
      userType == "Accounts" ||
      userType == "Procurement Manager"
    ) {
      console.log(page, limit, req.session.companyID, skip);
      const [documents] = await pool.query(`
    SELECT * 
    FROM rfp_categories
    WHERE company_id = ${req.session.companyID}
    LIMIT ${limit} OFFSET ${skip};
    `);

      // Render the view with documents or an empty array if none found
      res.render("admin/categories", {
        documents,
        page,
        totalPages,
        serialNumber,
        userType,
      });
    } else {
      res.status(404).send("Page not found");
    }
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/vendorData", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // Default limit to 10 items per page

  try {
    const companyID = req.session.companyID;
    const [record] = await pool.query(
      `SELECT COUNT(*) AS totalCount FROM rfp_user_details JOIN rfp_vendor_details on rfp_user_details.user_id = rfp_vendor_details.user_id WHERE rfp_user_details.company_id = ${companyID}`
    );
    const totalCount = record[0].totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    let skip = (page - 1) * limit;
    if (skip < 0) skip = 0;
    const userType = req.session.userType;
    if (
      userType == "Super Admin" ||
      userType == "Accounts" ||
      userType == "Procurement Manager"
    ) {
      let serialNumber = 1;

      const [vendorList] = await pool.query(`
    SELECT * 
    FROM rfp_user_details
    WHERE company_id = ${companyID} AND user_type = 'Vendor'
    LIMIT ${limit} OFFSET ${skip};
    `);

      for (let i = 0; i < vendorList.length; i++) {
        const userID = vendorList[i].user_id;
        const [vendor] = await pool.query(
          `SELECT * FROM rfp_vendor_details WHERE user_id = ${userID}`
        );
        vendorList[i].phoneNumber = vendor[0].phone_number;
        vendorList[i].status = vendor[0].vendor_status;
      }
      console.log(vendorList);
      res.render("admin/Vendor", {
        vendorList,
        page,
        totalPages,
        serialNumber,
        userType,
      });
    } else res.status(404).send("Page not found");
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
app.use("/EnterOTP", (req, res) => {
  res.render("EnterOTP");
});
app.use("/emailOTP", (req, res) => {
  res.render("emailOTP");
});
app.use("/vendorEmailOTP", (req, res) => {
  res.render("vendor/vendorEmailOTP");
});
app.use("/forgotPassword", (req, res) => {
  res.render("forgotPassword");
});
app.use("/resetPassword", (req, res) => {
  res.render("resetPassword");
});
app.use("/vendorRegistration", async (req, res) => {
  const [company] = await pool.query(
    `SELECT * FROM company WHERE company_name = '${req.session.companyName}'`
  );

  let prefill = {
    firstName: "",
    lastName: "",
    email: "",
  };
  if (req.session.firstName) {
    prefill = {
      firstName: req.session.firstName,
      lastName: req.session.lastName,
      email: req.session.email,
    };
  }

  const [documents] = await pool.query(
    `SELECT * FROM rfp_categories WHERE company_id = ${company[0].company_id} AND category_status = 'active'`
  );

  res.render("vendor/vendorRegistration", { documents, prefill });
});
app.use("/signup", signup);

app.use("/", (req, res) => {
  res.render("login");
});

app.listen(3000);
