function json(ctx, body, status = 200) {
    ctx.body = {
        ...body,
        success: status === 200,
        status,
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
