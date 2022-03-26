import express from "express";
import createHttpError from "http-errors";
import JobsModel from "./schema.js";
import passport from "passport";
import { adminOnlyMiddleware } from "../../auth/admin.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import { authenticateUser } from "../../auth/tools.js";
import q2m from "query-to-mongo";

const jobsRouter = express.Router();

jobsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await JobsModel.findJobWithUser(mongoQuery);
    const blogs = await JobsModel.find(mongoQuery.criteria)
      .populate({
        path: "user",
        select: ["_id", "firstName", "lastName", "role", "email"],
      })
      .sort(mongoQuery.options.sort)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.limit);
    res.send({
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
    });
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
    const newJob = new JobsModel({ ...req.body, user: req.user._id });
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

    const job = await JobsModel.findById(jobId).populate({
      path: "user",
      select: ["_id", "firstName", "lastName", "role", "email"],
    });
    if (job) {
      res.send(job);
    } else {
      next(createHttpError(404, `Job with id ${jobId} not found!`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

jobsRouter.put("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});

jobsRouter.delete("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default jobsRouter;