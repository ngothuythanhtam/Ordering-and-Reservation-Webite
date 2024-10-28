const usersService = require('../services/users.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function getManyUsersByRole(req, res, next) {
    const { userrole } = req.params; 
    if (!userrole ) {
        return next(new ApiError(400, 'Invalid user role. It should be a integer.'));
    }
    console.log('Received role id: ', userrole)
    let result = {
        Users: [],
        metadata: {
            totalRecords: 0,
            firstPage: 1,
            lastPage: 1,
            page: 1,
            limit: 5, 
        }
    };

    try {
        result = await usersService.getManyUsersByRole(userrole, req.query);
        if (result.Users.length === 0) {
            return res.status(404).json(JSend.fail({ message: 'No users found for this role.' }));
        }
        return res.status(200).json(JSend.success({
            Users: result.Users,
            metadata: result.metadata,
        }));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while fetching users.'));
    }
}

async function getUserByMail(req, res, next) {
  const { useremail } = req.query;  
  try {
    const users = await usersService.getUserByMail(useremail); 
    if (!users) {
      return next(new ApiError(404, 'useremail not found'));
    }
    return res.json(JSend.success({ users }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error retrieving user with useremail=${useremail}`));
  }
}

module.exports = {
    getManyUsersByRole,
    getUserByMail,
};
