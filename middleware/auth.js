const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("../routes/DB");

/**
 * This middleware is used to associate Google Authentication strategy with passport. 
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async function (req, accessToken, refreshToken, profile, cb) {
      try {
        // Check if the user already exists in rfpUserDetails based on their email
        const [existingUser] = await pool.query(`SELECT * FROM rfp_user_details WHERE email = '${profile.emails[0].value}'`)
        

        let user;
        console.log(existingUser);

        if (existingUser.length > 0) {
          // If the user exists, set its data into user variable
          user = {
            userType: existingUser[0].user_type,
            userID: existingUser[0].user_id,
            companyID: existingUser[0].company_id,
          };
        } else {
          // If the user doesn't exist, set the provided data into user variable
          user = {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
          };
        }
        console.log(user);

        return cb(null, {user});
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
