module.exports = exports = function (schema) {
    schema.statics.dataTable = async function (input, find) {
        let {limit, skip, search, searchColumns, order, orderBy} = input;
        if (search) {
            search = search.trim();
        }
        if (searchColumns && !Array.isArray(searchColumns)) {
            searchColumns = [searchColumns];
        }

        let query = {};
        if (search) {
            const searchQuery = searchColumns.map(item => {
                return {[item]: {$regex: `.*${search}.*`}};
            });
            if (find) {
                query = {
                    $and: [
                        find,
                        {$or: searchQuery},
                    ],
                };
            } else {
                query = {
                    $or: searchQuery,
                };
            }
        } else {
            query = find;
        }

        return this.find(query).sort({[orderBy]: order}).paginate(limit, skip);
    };
};
