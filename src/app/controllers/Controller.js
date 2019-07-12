/**
 * @apiDefine AuthHeader
 * @apiHeader {String} authorization JSON web token.
 */

/**
 * @apiDefine SuccessResponse
 * @apiSuccess {Boolean} success
 * @apiSuccess {Number} status http status code
 */

/**
 * @apiDefine Datatable
 * @apiParam {Number} limit=15 limit value for paginate query
 * @apiParam {Number} skip=0 skip value for paginate query
 * @apiParam {String} orderBy=_id sort order field
 * @apiParam {String="desc","asc"} order="desc" sort order direction
 * @apiParam {String} [search] search this value in database
 * @apiParam {String[]} [searchColumns] database columns for search
 * @apiSuccess {Boolean} success
 * @apiSuccess {Number} status http status code
 * @apiSuccess {Object[]} data array of records
 * @apiSuccess {Number} total total number of items
 */

/**
 * @api {model} /model/user User
 * @apiGroup Model
 * @apiParam {String} _id
 * @apiParam {String} id same as _id
 * @apiParam {String} firstName
 * @apiParam {String} lastName
 * @apiParam {String} email
 * @apiParam {String="instructor","student"} type
 * @apiParam {String="استاد","دانشجو"} typeFa
 * */

/**
 * @api {model} /model/course Course
 * @apiGroup Model
 * @apiParam {String} _id
 * @apiParam {String} id same as _id
 * @apiParam {String} title
 * @apiParam {String} userIsMember if authenticated user is course member
 * @apiParam {String} userIsOwner if authenticated user is course owner
 * @apiParam {String} userId owner user id
 * @apiParam {Object} user owner user. check `Model > User`
 * */

/**
 * @api {model} /model/post Post
 * @apiGroup Model
 * @apiParam {String} _id
 * @apiParam {String} id same as _id
 * @apiParam {String} title
 * @apiParam {String} content
 * @apiParam {String} userId creator user id
 * @apiParam {String} courseId course id that post is created in
 * @apiParam {String="alert","assignment","attendance","project","grade"} type post type
 * */