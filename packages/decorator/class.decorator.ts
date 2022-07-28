import { isObject, objectKeys } from "@/common/utils";
import { formatValidationError } from "@/common/utils/validate";
import { validateSync } from "class-validator";

type Consturctor = { new(...args: any[]): any };

export default function (validateClass) {
  return function <T extends Consturctor> (BaseClass: T) {
    return class extends BaseClass {
      constructor (...params) {
        super(...params);
        const designParamTypes = Reflect.getMetadata('design:paramtypes', BaseClass);
        const paramType = designParamTypes[1];
        const paramsObj = isObject(params[0]) ? params[0] : {}; 
        const validateInstance = new validateClass();
        objectKeys(paramsObj).forEach((key) => {
          validateInstance[key] = paramsObj[key]
        });
        const error = validateSync(validateInstance);
        if (error.length) {
          throw Error(formatValidationError(error))
        }
      }
    };
  };
}