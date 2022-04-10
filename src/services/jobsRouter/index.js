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
      .sort({ createdAt: -1 });
    res.send(jobs);
  } catch (error) {
    next(
      createHttpError(400, "Some errors occurred in jobsRouter body!", {
        message: error.message,
      })
    );
  }
});

jobsRouter.get("/titles", async (req, res, next) => {
  try {
    const authors = await JobsModel.find();
    res.send(authors);
  } catch (error) {
    next(error);
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

jobsRouter.get(`/c-search/:value`, async (req, res, next) => {
  try {
    const val = req.params.value;
    const search = await JobsModel.find({ companyName: { $regex: val } });
    if (search) {
      res.send(search);
    } else {
      console.log("not found");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

jobsRouter.get(`/t-search/:value`, async (req, res, next) => {
  try {
    const val = req.params.value;
    const search = await JobsModel.find({ title: { $regex: val } });
    if (search) {
      res.send(search);
    } else {
      console.log("not found");
    }
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

jobsRouter.get("/:id/tech", async (req, res, next) => {
  try {
    const user = await JobsModel.findById(req.params.id);
    if (user) {
      res.send(user.techStack);
    } else {
      next(createHttpError(404, `Profile with Id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(
      createHttpError(400, "Some errors occurred in profilerouter.get body!", {
        message: error.message,
      })
    );
  }
});
jobsRouter.get("/:id/offer", async (req, res, next) => {
  try {
    const user = await JobsModel.findById(req.params.id);
    if (user) {
      res.send(user.offers);
    } else {
      next(createHttpError(404, `Profile with Id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(
      createHttpError(400, "Some errors occurred in profilerouter.get body!", {
        message: error.message,
      })
    );
  }
});
jobsRouter.get("/:id/responsibilities", async (req, res, next) => {
  try {
    const user = await JobsModel.findById(req.params.id);
    if (user) {
      res.send(user.responsibilities);
    } else {
      next(createHttpError(404, `Profile with Id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(
      createHttpError(400, "Some errors occurred in profilerouter.get body!", {
        message: error.message,
      })
    );
  }
});
jobsRouter.get("/:id/requirements", async (req, res, next) => {
  try {
    const user = await JobsModel.findById(req.params.id);
    if (user) {
      res.send(user.requirements);
    } else {
      next(createHttpError(404, `Profile with Id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(
      createHttpError(400, "Some errors occurred in profilerouter.get body!", {
        message: error.message,
      })
    );
  }
});

jobsRouter.post("/:id/tech", async (req, res, next) => {
  try {
    const updatedProfile = await JobsModel.findByIdAndUpdate(
      req.params.id,
      { $push: { techStack: req.body } },
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
        "Some errors occurred in profileRouter.post experiences body!",
        {
          message: error.message,
        }
      )
    );
  }
});
jobsRouter.post("/:id/offer", async (req, res, next) => {
  try {
    const updatedProfile = await JobsModel.findByIdAndUpdate(
      req.params.id,
      { $push: { offers: req.body } },
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
        "Some errors occurred in profileRouter.post experiences body!",
        {
          message: error.message,
        }
      )
    );
  }
});

jobsRouter.post("/:id/responsibilities", async (req, res, next) => {
  try {
    const updatedProfile = await JobsModel.findByIdAndUpdate(
      req.params.id,
      { $push: { responsibilities: req.body } },
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
        "Some errors occurred in profileRouter.post experiences body!",
        {
          message: error.message,
        }
      )
    );
  }
});

jobsRouter.post("/:id/requirements", async (req, res, next) => {
  try {
    const updatedProfile = await JobsModel.findByIdAndUpdate(
      req.params.id,
      { $push: { requirements: req.body } },
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
        "Some errors occurred in profileRouter.post experiences body!",
        {
          message: error.message,
        }
      )
    );
  }
});

export default jobsRouter;
