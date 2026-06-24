import { createError } from "../utils/createError.js";
import User from "../models/User.js";

export const register = async (req, res, next) => {
  try {
    const day = req.params.day;
    const id = req.params.id;

    if (!day || !id) {
      const err = createError(400, error.message);
      next(err);
    }

    const user = await User.findOne({ _id: id.toString() });
    if (!user) {
      const err = createError(404, "ID is incorrect");
      next(err);
    }

    const isUpdate = await user.updateOne({ $push: { register: day } });
    if (!isUpdate) {
      const err = createError(404, error.message);
      next(err);
    }

    return res.status(200).json({
      message: "Register",
      isUpdate,
    });
  } catch (error) {
    const err = createError(500, error.message);
    next(err);
  }
};

export const visit = async (req, res, next) => {
  try {
    const day = req.params.day;
    const id = req.params.id;
    const boot = req.params.boot;

    if (!day || !id || !boot) {
      const err = createError(400, error.message);
      next(err);
    }

    const user = await User.findOne({ _id: id.toString() });
    if (!user) {
      const err = createError(404, "ID is incorrect");
      next(err);
    }

    const isUpdate = await user.updateOne({ $push: { boot: boot } });
    if (!isUpdate) {
      const err = createError(404, error.message);
      next(err);
    }

    return res.status(200).json({
      message: `Visit ${boot} complete`,
    });
  } catch (error) {
    const err = createError(500, error.message);
    next(err);
  }
};
