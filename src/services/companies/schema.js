import mongoose from "mongoose";

const { Schema, model } = mongoose;

const comSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    companySize: { type: String },
    established: { type: Date },
    cover: { type: String },
    banner: { type: String },
    website: { type: String },
    linkedin: { type: String },
    jobs: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        location: { type: String, required: true },
        salary: { type: String },
        experience: {
          type: String,
          enum: ["0-2", "2-4", "4-6", "6+"],
          default: "0-2",
        },
        type: {
          type: String,
          enum: ["B2B", "Permanent"],
          default: "B2B",
        },
        techStack: [{ skill: { type: String } }],
        offers: [{ offer: { type: String } }],
        responsibilities: [{ responsibility: { type: String } }],
        requirements: [{ requirement: { type: String } }],
      },
    ],
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
