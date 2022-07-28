import { isUndefined, isObject, objectKeys } from '@/common/utils';
import { formatValidationError } from '@/common/utils/validate';
import {
  registerDecorator,
  ValidationOptions,
  buildMessage,
  validateSync,
} from 'class-validator';


const requiredMetadataKey = Symbol("required")

export function required(target, propertyKey: string | symbol, parameterIndex: number) {
  const existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}

export const throwError = (param: string, index: number) => {
  throw Error(`Failed for validating parameter: ${param} of the index: ${index}`)
}

export default function ValidateClass() {
  return function <T extends { new(...args: any[]): any }>(BaseClass: T) {
    return class extends BaseClass {
      constructor(...params) {
        super(...params);
        const requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, BaseClass);
        const designParamTypes = Reflect.getMetadata('design:paramtypes', BaseClass);
        if (requiredParameters.length) {
          for (const index of requiredParameters) {
            const paramType = designParamTypes[index];
            const param = params[index];
            if (isUndefined(param)) throwError(param, index);
            const validateResult = param.constructor === paramType || param instanceof paramType;
            if (!validateResult && isObject(param)) {
              try {
                const validateInstance = new paramType();
                objectKeys(param).forEach((key) => {
                  validateInstance[key] = param[key]
                });
                const b = validateSync(validateInstance);
              } catch (error) {
                throwError(JSON.stringify(param), index);
              }
            }
          }
        }
        // const validateInstance = new validateClass();
        // objectKeys(paramsObj).forEach((key) => {
        //   validateInstance[key] = paramsObj[key]
        // });
        // const error = validateSync(validateInstance);
        // if (error.length) {
        //   throw Error(formatValidationError(error))
        // }
      }
    };
  };
}