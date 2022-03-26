import mongoose from "mongoose";
import searchable from "mongoose-regex-search";

const { Schema, model } = mongoose;

const jobsSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    company: { type: String, required: true },
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
