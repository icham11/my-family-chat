const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "PLACEHOLDER_SECRET",
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user exists by Google ID
        let user = await User.findOne({ where: { google_id: profile.id } });

        if (user) {
          return done(null, user);
        }

        // 2. Check if email exists (link account)
        if (profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          user = await User.findOne({ where: { email } });
          if (user) {
            // Link account
            user.google_id = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        // 3. Create new user
        // Generate unique username from display name or email
        let baseUsername = profile.displayName
          .replace(/\s+/g, "")
          .toLowerCase();
        let username = baseUsername;
        let counter = 1;
        while (await User.findOne({ where: { username } })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        const newUser = await User.create({
          username,
          email: profile.emails ? profile.emails[0].value : null,
          google_id: profile.id,
          avatar_url: profile.photos ? profile.photos[0].value : null,
        });

        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

module.exports = passport;
