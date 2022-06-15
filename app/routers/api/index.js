const express = require('express');
const router = express.Router();
const userController = require('../../controllers/api/user');
const apiErrorController = require('../../controllers/api/error');
const validator = require('../../validation/validator');
const userGetSchema = require('../../validation/schemas/userGet.schema');
const checkAuth = require('../../middlewares/checkAuth')
/* const userPostSchema = require('../../validation/schemas/cadexPost.schema'); */

router.route('/users')
    /**
     * GET /api/users
     * @summary To get all users with their photos
     * @return {object} 200 - success response
     * @return {object} 400 - input data invalid
     */
/*     .get(validator('query', userGetSchema), userController.getAll) */
       .get(userController.getAllWithPhotos)

       
router.route('/user/connexion')
/**
* POST /api/user/connexion
* @summary To verified if email match with password
* @param  {object} request.body.required - user object with only email and password
* @return {object} 200 - success response
* @return {object} 400 - input data invalid
*/
.post(userController.verifyAuthentification) 

       

router.route('/user/create')
/**
 * POST /api/user/create
 * @summary To create one user
 * @return {object} 200 - success response
 * @return {object} 400 - input data invalid
 */
.post(userController.createOne)

router.route('/user/delete')
/**
 * DELETE /api/user/delete
 * @summary To delete one user
 * @return {object} 200 - success response
 * @return {object} 400 - input data invalid
 */
.delete(userController.deleteOne)

router.route('/user/:id') 
    /**
    * GET /api/user
    * @summary To get one user with his photo
    * @param {number} request.query.required - user id
    * @return {object} 200 - success response
    * @return {object} 400 - input data invalid
    */
    .get(userController.getOneWithPhoto) 


router.use(apiErrorController.error404);

module.exports = router;