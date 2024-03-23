const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const pool = require("./DB");

/**
 * Return an OTP number
 * @returns int
 */
function generateOtp() {
  const secret = speakeasy.generateSecret({ length: 10 });
  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
  });
  return otp;
}


/**
 * Function to save an otp corresponding to an email 
 */
async function saveOtpToDatabase(email, otp) {
  
  const [recordotp] = await pool.query(`SELECT * FROM otp WHERE email = '${email}';`);
  // Check if email alredy exists in the DB
  if (recordotp.length > 0) {
    // If yes updating the otp corresponding to that otp
    await pool.query(`UPDATE otp SET otp.otp = ${otp} WHERE otp.email = '${email}';`);
  } else {
    // Otherwise saving a new record in otp table
    await pool.query(`INSERT INTO otp (email,otp) VALUES ('${email}',${otp});`);
  }
}

const sendMail = (subject, ReceiverEmail, emailMessage) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.Mail_User_Id,
      pass: process.env.Mail_password,
    },
  });
  const mailOptions = {
    from: process.env.Mail_User_Id,
    to: ReceiverEmail,
    subject: subject,
    text: emailMessage,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = { saveOtpToDatabase, sendMail, generateOtp };
