import mongoose from "mongoose";

const { Schema, model } = mongoose;

const comSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    companySize: { type: String },
    established: { type: Date },
    cover: { type: String },
    banner: { type: String },
    website: { type: String },
    linkedin: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

comSchema.static("findCompanyWithUser", async function (mongoQuery) {
  const total = await this.countDocuments(mongoQuery.criteria);
  const companies = await this.find(mongoQuery.criteria)
    .limit(mongoQuery.options.limit)
    .skip(mongoQuery.options.skip)
    .sort(mongoQuery.options.sort)
    .populate({
      path: "user",
      select: "firstName lastName email role",
    });
  return { total, companies };
});

export default model("Company", comSchema);
