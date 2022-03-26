import createError from "http-errors";

export const adminOnlyMiddleware = (req, res, next) => {
  if (req.user.role === "Admin") {
    next();
  } else {
    next(createError(403, "Admin only endpoint!"));
  }
};
