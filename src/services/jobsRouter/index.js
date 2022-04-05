import express from "express";
import createHttpError from "http-errors";
import JobsModel from "./schema.js";
import { adminOnlyMiddleware } from "../../auth/admin.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import q2m from "query-to-mongo";

const jobsRouter = express.Router();

jobsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await JobsModel.findJobWithUser(mongoQuery);
    const jobs = await JobsModel.find(mongoQuery.criteria)
      .populate({
        path: "user",
        select: ["_id", "firstName", "lastName", "role", "email"],
      })
      .populate({
        path: "applicants",
        populate: {
          path: "applicant",
          model: "User",
          select: [
            "_id",
            "firstName",
            "lastName",
            "image",
            "myExperience",
            "city",
          ],
        },
      })
      .sort(mongoQuery.options.sort);
    res.send(jobs);
  } catch (error) {
    next(
      createHttpError(400, "Some errors occurred in jobsRouter body!", {
        message: error.message,
      })
    );
  }
});

jobsRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const newJob = new JobsModel({
      ...req.body,
      user: req.user._id,
    });
    const { _id } = await newJob.save();
    res.status(201).send(newJob);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

jobsRouter.get("/:id", async (req, res, next) => {
  try {
    const jobId = req.params.id;

    const job = await JobsModel.findById(jobId)
      .populate({
        path: "user",
        select: ["_id", "firstName", "lastName", "role", "email"],
      })
      .populate({
        path: "applicants",
        populate: {
          path: "applicant",
          model: "User",
          select: [
            "_id",
            "firstName",
            "lastName",
            "image",
            "myExperience",
            "city",
          ],
        },
      });

    if (job) {
      res.send(job);
    } else {
      res.send(`Job with id ${jobId} not found!`);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

jobsRouter.put("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const updatedJob = await JobsModel.findByIdAndUpdate(jobId, req.body, {
      new: true,
    });
    if (updatedJob) {
      res.send(updatedJob);
    } else {
      res.send(`Job with id ${jobId} not found!`);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

jobsRouter.delete("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const deletedJob = await JobsModel.findByIdAndDelete(jobId);
    if (deletedJob) {
      res.status(204).send(`Job with id ${jobId} deleted!`);
    } else {
      res.send(`Job with id ${jobId} not found!`);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

jobsRouter.post("/:id/applicants", async (req, res, next) => {
  try {
    const updatedProfile = await JobsModel.findByIdAndUpdate(
      req.params.id,
      { $push: { applicants: req.body } },
      { new: true }
    );
    if (updatedProfile) {
      res.send(updatedProfile);
    } else {
      next(createHttpError(404, `Job with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(
      createHttpError(
        400,
        "Some errors occurred in jobsRouter.post experiences body!",
        {
          message: error.message,
        }
      )
    );
  }
});

export default jobsRouter;
