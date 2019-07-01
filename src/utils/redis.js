export function deleteByPattern(redis, key) {
    return new Promise((resolve) => {
        const stream = redis.scanStream({
            match: `${process.env.REDIS_PREFIX}:${key}`,
        });
        stream.on('data', function (resultKeys) {
            resultKeys = resultKeys.map(item => item.replace(`${process.env.REDIS_PREFIX}:`, ''));
            if (resultKeys.length) {
                redis.unlink(resultKeys);
            }
        });
        stream.on('end', function () {
            resolve();
        });
    });
}
