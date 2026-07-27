import mongoose from "mongoose";
import { CustomHttpException } from "../exceptions/http-exception";

export const isValidObjectId = (id: string | undefined): id is string =>
  Boolean(id && mongoose.Types.ObjectId.isValid(id));

export const assertValidObjectId = (id: string | undefined, label = "ID"): string => {
  if (!isValidObjectId(id)) {
    throw new CustomHttpException(400, `Invalid ${label}`);
  }

  return id;
};
