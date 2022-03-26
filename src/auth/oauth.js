import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import UsersModel from "../services/users/userSchema.js";
import { authenticateUser } from "./tools.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.API_URL}/users/googleRedirect`,
  },
  async (accessToken, refreshToken, profile, passportNext) => {
    try {
      console.log(profile);

      const user = await UsersModel.findOne({ email: profile.emails[0].value });

      if (user) {
        const token = await authenticateUser(user);

        passportNext(null, { token, role: user.role });
      } else {
        const newUser = new UsersModel({
          name: profile.name.givenName,
          surname: profile.name.familyName,
          email: profile.emails[0].value,
          googleId: profile.id,
        });

        const savedUser = await newUser.save();
        const token = await authenticateUser(savedUser);

        passportNext(null, { token });
      }
    } catch (error) {
      passportNext(error);
    }
  }
);

passport.serializeUser((data, passportNext) => {
  passportNext(null, data);
});

export default googleStrategy;
