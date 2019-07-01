import moment from 'moment-jalaali';

module.exports = exports = function cursorPaginate(schema) {
    schema.virtual('createdAtJ').get(function () {
        return moment(this.created_at).format('jYYYY/jMM/jDD HH:mm');
    });

    schema.virtual('updatedAtJ').get(function () {
        return moment(this.updated_at).format('jYYYY/jMM/jDD HH:mm');
    });
};
