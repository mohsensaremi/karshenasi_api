import response from 'app/response';

export default async function (ctx, next) {
    try {
        await next();
    } catch (e) {
        switch (e.name) {
            case 'ValidatorException':
                return response.validatorError(ctx, [{err: e.message}]);
        }
        throw e;
    }
}
