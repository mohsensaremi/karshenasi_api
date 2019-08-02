import mongoose from 'mongoose';
import {ObjectId} from "bson";

class Schema extends mongoose.Schema {
    constructor(definition, options) {

        options = {
            timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
            toObject: {
                virtuals: true,
                getters: true,
            },
            toJSON: {
                virtuals: true,
                getters: true,
            },
            ...options,
        };

        super(definition, options);

        this.virtual('id').get(function () {
            if (this._id instanceof ObjectId) {
                return this._id.toString();
            }
            return this._id;
        });
    }
}

export default Schema;
