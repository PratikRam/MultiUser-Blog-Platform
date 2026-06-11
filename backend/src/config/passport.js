const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:8080/api/auth/google/callback',
        },  
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                if (!email) {
                    return done(new Error("No email found in Google profile"), null);
                }

                let user = await User.findOne({ email });

                if (!user) {
                    // Create new user without password (since they are registering with Google)
                    user = await User.create({
                        name: profile.displayName || "Google User",
                        email: email,
                        googleId: profile.id,
                        role: "visitor",
                    });
                } else {
                    // Link Google ID if existing email user logs in with Google for the first time
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

module.exports = passport;
