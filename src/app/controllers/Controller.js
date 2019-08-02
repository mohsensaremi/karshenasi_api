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
 * @apiParam {Date} dueDate ISO date string
 * @apiParam {File[]} files array if uploaded files. check `Model > File`
 * */

/**
 * @api {model} /model/uploadFile UploadFile
 * @apiGroup Model
 * @apiParam {String} name file name
 * @apiParam {Boolean=false} fresh if true, file will be moved from tmp to real place.
 * @apiParam {Boolean=false} deleted if true, file will be removed.
 * */

/**
 * @api {model} /model/file File
 * @apiGroup Model
 * @apiParam {String} name file name
 * @apiParam {String} url url to download file
 * */
