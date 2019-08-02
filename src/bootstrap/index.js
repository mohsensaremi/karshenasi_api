global.BASE_PATH = __dirname + '/../..';
global.TEMP_PATH = `${BASE_PATH}/tmp`;
global.STORAGE_PATH = `${BASE_PATH}/storage`;

import 'config/dotenv';
import 'config/database';
import 'config/moment';
