import { buildMessage, registerDecorator, ValidationOptions } from 'class-validator';

export function EqualsList(comparison: any[], validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'EqualsList',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any) => comparison.includes(value),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be ' + comparison.join(','),
          validationOptions,
        ),
      },
    });
  };
}