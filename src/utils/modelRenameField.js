import {Schema} from "mongoose";

export default (schema, original, name, defaultValue = null) => {
    schema.virtual(name).get(function () {
        return this[original] || defaultValue;
    });
};