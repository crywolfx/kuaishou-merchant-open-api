export const validate = () => {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...args) {
      return original.call(this, ...args);
    };
  };
}