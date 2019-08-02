import fs from 'fs';
import path from 'path';
import uuid from 'uuid/v4';

export async function tmp(ctx) {
    const file = ctx.request.files.file;
    const name = uuid();
    const extension = path.extname(file.name);
    const fullName = `${name}${extension}`.toLowerCase();
    const reader = fs.createReadStream(file.path);
    const stream = fs.createWriteStream(path.join(TEMP_PATH, fullName));
    reader.pipe(stream);
    console.log('uploading %s -> %s', file.name, stream.path);

    ctx.body = {
        data: {
            name: fullName,
        },
    };
};
