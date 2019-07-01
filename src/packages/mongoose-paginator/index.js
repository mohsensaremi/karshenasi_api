module.exports = exports = function (schema) {
    schema.query.paginate = async function (limit, skip) {
        limit = parseInt(limit);
        skip = parseInt(skip);
        const countQuery = this.model.find().merge(this);
        countQuery.options = {};

        const query = this.skip(skip).limit(limit);

        const [total, data] = await Promise.all([countQuery.countDocuments(), query]);

        return {data, total};
    };
};
