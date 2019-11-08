import {Request, Response} from "express";

const _global = (window /* browser */ || global /* node */) as any;

_global.validateRequest = function <T>(object: T | null | undefined, defaultValue: T | null = null): T {
    if (typeof object === 'undefined' || object === null)
        return defaultValue as T;
    else
        return object;
};

_global.contextProvider = (fn: Function) => (req: Request, res: Response) => {
    const context = {req, res};
    return fn(context);
};

