import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./userSchema.js";
import passport from "passport";
import { adminOnlyMiddleware } from "../../auth/admin.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import { authenticateUser } from "../../auth/tools.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import JobsModel from "../jobsRouter/schema.js";
import CompModel from "../companies/schema.js";

const cloudinaryUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "capstone users",
    },
  }),
}).single("image");

const usersRouter = express.Router();

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const reqUser = await UsersModel.findById(req.user._id);
    if (reqUser) {
      res.status(201).send(reqUser);
    } else {
      next(createError(404, "user not found"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await UsersModel.findByIdAndDelete(req.user._id);
    res.send();
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me/jobs", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const jobs = await JobsModel.find({ user: req.user._id.toString() });

    res.status(200).send(jobs);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me/jobs/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const jobs = await JobsModel.findById({
      user: req.user._id.toString(),
      _id: req.params.id,
    });

    res.status(200).send(jobs);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me/companies", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const jobs = await CompModel.find({ user: req.user._id.toString() });

    res.status(200).send(jobs);
  } catch (error) {
    next(error);
  }
});

usersRouter.get(
  "/me/companies/:id",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const jobs = await CompModel.findById({
        user: req.user._id.toString(),
        _id: req.params.id,
      });

      res.status(200).send(jobs);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post(
  "/me/image",
  JWTAuthMiddleware,
  cloudinaryUpload,
  async (req, res, next) => {
    try {
      const userId = req.user._id;
      const updated = await UsersModel.findByIdAndUpdate(
        userId,
        { image: req.file.path },
        {
          new: true,
        }
      );
      if (updated) {
        res.send(updated);
      } else {
        next(createHttpError(404, `User with id ${userId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UsersModel.checkCredentials(email, password);

    if (user) {
      const accessToken = await authenticateUser(user);
      res.send({ accessToken });
    } else {
      next(createError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const savedUser = await newUser.save();
    const accessToken = await authenticateUser(savedUser);
    res.send({ accessToken });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    next(
      createHttpError(400, "Some errors occurred in usersRouter.post body!", {
        message: error.message,
      })
    );
  }
});

usersRouter.get(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const user = await UsersModel.find();
      res.send(user);
    } catch (error) {
      next(
        createHttpError(400, "Some errors occurred in usersRouter body!", {
          message: error.message,
        })
      );
    }
  }
);

usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  (req, res, next) => {
    try {
      console.log(req.user.token);

      if (req.user.role === "Admin") {
        res.redirect(
          `${process.env.FE_URL}/home?accessToken=${req.user.token}`
        );
      } else {
        res.redirect(
          `${process.env.FE_URL}/home?accessToken=${req.user.token}`
        );
      }
    } catch (error) {
      console.log(error);
      next(
        createHttpError(400, "Some errors occurred in usersRouter body!", {
          message: error.message,
        })
      );
    }
  }
);

export default usersRouter;
