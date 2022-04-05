import express from "express";
import createHttpError from "http-errors";
import CompanyModel from "./schema.js";
import { adminOnlyMiddleware } from "../../auth/admin.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import q2m from "query-to-mongo";

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const bannerUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "capstone comp banner",
    },
  }),
}).single("image");

const coverUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "capstone comp cover",
    },
  }),
}).single("image");

const companiesRouter = express.Router();

companiesRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await CompanyModel.findCompanyWithUser(mongoQuery);
    const blogs = await CompanyModel.find(mongoQuery.criteria)
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
    console.log(error);
    next(error);
  }
});

companiesRouter.get(`/search/:value`, async (req, res, next) => {
  try {
    const val = req.params.value;
    const search = await CompanyModel.find({ name: { $regex: val } });
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

companiesRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const newComp = new CompanyModel({
      ...req.body,
      user: req.user._id,
    });
    const { _id } = await newComp.save();
    res.status(201).send(newComp);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

companiesRouter.get("/:id", async (req, res, next) => {
  try {
    const jobId = req.params.id;

    const job = await CompanyModel.findById(jobId).populate({
      path: "user",
      select: ["_id", "firstName", "lastName", "role", "email"],
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

companiesRouter.put("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const updatedJob = await CompanyModel.findByIdAndUpdate(jobId, req.body, {
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

companiesRouter.delete("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const deletedJob = await CompanyModel.findByIdAndDelete(jobId);
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

companiesRouter.post(
  "/:id/banner",
  JWTAuthMiddleware,
  bannerUpload,
  async (req, res, next) => {
    try {
      const userId = req.params.id;
      const updated = await CompanyModel.findByIdAndUpdate(
        userId,
        { banner: req.file.path },
        {
          new: true,
        }
      );
      if (updated) {
        res.send(updated);
      } else {
        next(createHttpError(404, `Company with id ${userId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

companiesRouter.post(
  "/:id/cover",
  JWTAuthMiddleware,
  coverUpload,
  async (req, res, next) => {
    try {
      const userId = req.params.id;
      const updated = await CompanyModel.findByIdAndUpdate(
        userId,
        { cover: req.file.path },
        {
          new: true,
        }
      );
      if (updated) {
        res.send(updated);
      } else {
        next(createHttpError(404, `Company with id ${userId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default companiesRouter;
