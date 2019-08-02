import response from 'app/response';
import fs from 'fs';
import path from 'path';
import uuid from 'uuid/v4';

/**
 * @api {post} /upload/tmp upload tmp
 * @apiDescription upload file to tmp directory
 * @apiParam {File} file
 * @apiGroup Upload
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {UploadFile} data check `Model > UploadFile`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": UploadFile }
 * */
export async function tmp(ctx) {
    const file = ctx.request.files.file;
    const name = uuid();
    const extension = path.extname(file.name);
    const fullName = `${name}${extension}`.toLowerCase();
    const reader = fs.createReadStream(file.path);
    const stream = fs.createWriteStream(path.join(TEMP_PATH, fullName));
    reader.pipe(stream);
    console.log('uploading %s -> %s', file.name, stream.path);

    return response.json(ctx, {
        data: {
            name: fullName,
            fresh: true,
        },
    });
};
