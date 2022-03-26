import express from "express";
import createHttpError from "http-errors";
import CompanyModel from "./schema.js";
import { adminOnlyMiddleware } from "../../auth/admin.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import q2m from "query-to-mongo";

const companiesRouter = express.Router();

companiesRouter.get("/", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});

companiesRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});

companiesRouter.get("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});

companiesRouter.put("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});

companiesRouter.delete("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default companiesRouter;
