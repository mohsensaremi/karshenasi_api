import mongoose from 'mongoose';

export {default as Schema} from './Schema';

mongoose.plugin(require('packages/mongoose-jalali-timestamps'));
mongoose.plugin(require('packages/mongoose-paginator'));
mongoose.plugin(require('packages/mongoose-data-table'));

