import 'reflect-metadata';
import { isUndefined, isObject, objectKeys } from '@/common/utils';
import { formatValidationError } from '@/common/utils/validate';
import { validateSync } from 'class-validator';


const requiredMetadataKey = Symbol("required");

export function Required(target, propertyKey: string | symbol, parameterIndex: number) {
  const existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}

export const throwError = (param: string, index: number, message?: string) => {
  const msg = `Failed for validating parameter: ${param} of the index: ${index} ${message ? ', ' + message : ''}`;
  throw Error(msg)
}

export const handlerValidate = (params: any[], requiredParameters: number[], designParamTypes: any) => {
  if (requiredParameters?.length) {
    for (const index of requiredParameters) {
      const paramType = designParamTypes[index];
      const param = params[index];
      if (isUndefined(param)) throwError(param, index);
      const validateResult = param.constructor === paramType || param instanceof paramType || param.constructor.__proto__ instanceof paramType;
      if (!validateResult && isObject(param)) {
        try {
          const validateInstance = new paramType();
          objectKeys(param).forEach((key) => {
            validateInstance[key] = param[key]
          });
          const errorList = validateSync(validateInstance);
          if (errorList?.length) {
            throw Error(formatValidationError(errorList));
          }
        } catch (error: any) {
          throwError(JSON.stringify(param), index, error?.message);
        }
      }
    }
  }
}

export function ValidateClass() {
  return function <T extends { new(...args: any[]): any }>(BaseClass: T) {
    return class extends BaseClass {
      constructor(...params) {
        super(...params);
        const requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, BaseClass);
        const designParamTypes = Reflect.getMetadata('design:paramtypes', BaseClass);
        handlerValidate(params, requiredParameters, designParamTypes);
      }
    };
  };
}

export function Validate () {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    const requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey);
    const designParamTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
    descriptor.value = function (...params) {
      handlerValidate(params, requiredParameters, designParamTypes);
      return original.call(this, ...params);
    }
  }
}