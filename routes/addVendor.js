const express = require("express");
const router = express.Router();
const { generateOtp, saveOtpToDatabase, sendMail } = require("./sendMail");

router.post("/", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (firstName == "") {
    errors.firstNameError = `*Please enter the First Name`;
    flag = true;
  }
  if (lastName == "") {
    errors.lastNameError = `*Please enter the Last Name`;
    flag = true;
  }
  if (!emailRegex.test(email)) {
    errors.emailError = `*Please enter the email in correct format i.e. "abc@gmail.com"`;
    flag = true;
  }
  if (password.length < 8) {
    errors.passwordError = `*Length of password must be greater than 8`;
    flag = true;
  }
  if (password !== confirmPassword) {
    errors.confirmPasswordError = `*Both the passwords must match`;
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

  //Generating an OTP
  const otp = generateOtp();
  //saving otp into DB
  saveOtpToDatabase(email, otp);

  //sending mail to the receiver
  const emailMessage = `Your OTP for email verification is: ${otp}`;
  const subject = `OTP for Email verification`;
  sendMail(subject, email, emailMessage);
  req.session.email = email;
  req.session.firstName = firstName;
  req.session.lastName = lastName;
  req.session.password = password;
  req.session.revenue = revenue;
  req.session.numberOfEmployees = numberOfEmployees;
  req.session.GSTno = GSTno;
  req.session.PAN = PAN;
  req.session.phoneNumber = phoneNumber;
  req.session.category = category;
  res.send({ message: "Otp sent." });
});

module.exports = router;
