import {Request, Response} from "express";

export {}

declare global {
    function validateRequest<T>(someObject: T | null | undefined, defaultValue?: T | null | undefined): T;

    function contextProvider(fn: Function): (req: Request, res: Response) => any;
}
