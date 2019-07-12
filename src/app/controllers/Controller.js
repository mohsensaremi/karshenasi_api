/**
 * @apiDefine AuthHeader
 * @apiHeader {String} Authorization JSON web token.
 */

/**
 * @apiDefine SuccessResponse
 * @apiSuccess {Object} data
 * @apiSuccess {Boolean} data.success
 * @apiSuccess {Number} data.status http status code
 */

/**
 * @apiDefine Datatable
 * @apiParam {Number} limit limit value for paginate query
 * @apiParam {Number} skip skip value for paginate query
 * @apiParam {String} orderBy sort order field
 * @apiParam {String="desc","asc"} order sort order direction
 * @apiParam {String} search search this value in database
 * @apiParam {String[]} searchColumns database columns for search
 * @apiSuccess {Object} data
 * @apiSuccess {Boolean} data.success
 * @apiSuccess {Number} data.status http status code
 * @apiSuccess {Object[]} data.data array of records
 * @apiSuccess {Number} data.total total number of items
 */