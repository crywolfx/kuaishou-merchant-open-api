declare type Consturctor = {
    new (...args: any[]): any;
};
export default function (validateClass: any): <T extends Consturctor>(BaseClass: T) => {
    new (...params: any[]): {
        [x: string]: any;
    };
} & T;
export {};
