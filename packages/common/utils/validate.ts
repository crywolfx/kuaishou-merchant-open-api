import { ValidationError } from "class-validator";
import flatten from "lodash.flatten";

export const formatValidationError = (error: ValidationError[]) => flatten(error.map((errorItem) => Object.values(errorItem.constraints))).join(';');