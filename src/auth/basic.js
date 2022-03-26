import createError from "http-errors";
import atob from "atob";
import UsersModel from "../services/users/userSchema.js";

export const basicAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createError(401, "Please provide credentials in Authorization header")
    );
  } else {
    const base64Credentials = req.headers.authorization.split(" ")[1];

    const [email, password] = atob(base64Credentials).split(":");

    const user = await UsersModel.checkCredentials(email, password);

    if (user) {
      req.user = user;
      next();
    } else {
      next(createError(401, "Credentials are not OK!"));
    }
  }
};
