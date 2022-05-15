import mongoose from "mongoose";

const { Schema, model } = mongoose;

const now = new Date();

const jobsSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    companyName: { type: String },
    location: { type: String },
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
    techStack: [{ skill: { type: String, unique: true } }],
    techs: { type: String },
    offers: [{ offer: { type: String } }],
    responsibilities: [{ responsibility: { type: String } }],
    requirements: [{ requirement: { type: String } }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    applicants: [
      {
        applicant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: { type: Date, default: now },
      },
      {
        timestamps: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

jobsSchema.static("findJobWithUser", async function (mongoQuery) {
  const total = await this.countDocuments(mongoQuery.criteria);
  const jobs = await this.find(mongoQuery.criteria)
    .limit(mongoQuery.options.limit)
    .skip(mongoQuery.options.skip)
    .sort(mongoQuery.options.sort)
    .populate({
      path: "user",
      select: "firstName lastName email role",
    });
  return { total, jobs };
});

export default model("Job", jobsSchema);
