function json(ctx, data, status = 200) {
    ctx.body = {
        success: status === 200,
        status,
        data,
    };
}

function validatorError(ctx, errors) {
    return json(ctx, {
        errors: errors.map(item => Object.values(item)[0]),
    }, 422);
}

function unauthorized(ctx, errors = ['unauthorized']) {
    return json(ctx, {
        errors,
    }, 401);
}

export default {
    json,
    validatorError,
    unauthorized,
};
