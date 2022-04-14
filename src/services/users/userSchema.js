import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: {
      type: String,
      default:
        "https://th.bing.com/th/id/R.eb129b8ff6ef96fdd506bd73e3f5519e?rik=s7YZKeEj9XiOCQ&pid=ImgRaw&r=0",
    },
    github: { type: String },
    linkedin: { type: String },
    aboutMe: { type: String },
    myResume: { type: String },
    city: { type: String },
    phoneNumber: { type: String },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    myExperience: {
      type: String,
      enum: ["0-2", "2-4", "4-6", "6+"],
      default: "0-2",
    },
    googleId: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const newUser = this;
  const plainPw = newUser.password;

  if (newUser.isModified("password")) {
    const hash = await bcrypt.hash(plainPw, 11);
    newUser.password = hash;
  }

  next();
});

userSchema.methods.toJSON = function () {
  const userDocument = this;
  const userObject = userDocument.toObject();

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

userSchema.statics.checkCredentials = async function (email, plainPW) {
  const user = await this.findOne({ email });

  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password);

    if (isMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default model("User", userSchema);
