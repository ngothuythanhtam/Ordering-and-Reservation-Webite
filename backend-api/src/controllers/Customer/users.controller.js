const usersService = require('../../services/Customer/users.service');
const ApiError = require('../../api-error');
const JSend = require('../../jsend');

async function login(req, res, next) {
    const { useremail, userpwd } = req.body;
    try {
        if (req.session && req.session.user && req.session.user.userid) {
            return res.json(JSend.success('Logged in!'));
        }
        const checkExistEmail = await usersService.checkExistEmail(req.body.useremail);
        if (!checkExistEmail) {
            return next(new ApiError(404,"You don't have an account yet. Please click register."));
        } 
        const user = await usersService.login(useremail, userpwd);
        req.session.user = {
            userid: user.userid,
            useremail: user.useremail,
            userrole: user.userrole,
            useravatar: user.useravatar
        };
        console.log(req.session.user.userid,req.session.user.useravatar );
        req.session.save(err => {
            if (err) return next(err);
            return res.status(200).json(JSend.success({ 
                message: 'Log in successfully!', 
                data: req.session.user, 
            }));
        });
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
}
async function logout(req, res, next) {
    if (!req.session.user) {
        return res.json(JSend.success('You are not logged in!'));
    }
    req.session.destroy((err) => {
        if (err) {
            return next(new ApiError(500, 'Error logging out, please try again.'));
        }
        res.clearCookie('connect.sid');

        return res.status(200).json(JSend.success({ message: 'Sign out successfully!' }));
    });
}
async function createUser(req, res, next) {
    if (!req.body.userrole || !req.body.username || !req.body.userbirthday || !req.body.userphone || !req.body.useremail) {
        return next(new ApiError(400, 'Invalid data' ));
    }
    if (isNaN(new Date(req.body.userbirthday))) {
        return next(new ApiError(400, 'Date of birth is not a valid date!' ));
    }
    if (typeof req.body.userphone !== 'string' || !/^\d{10}$/.test(req.body.userphone)) {
        return next(new ApiError(400, 'The phone number must be a series of 10 numbers!' ));
    }
    if (typeof req.body.useremail !== 'string' || !/\S+@\S+\.\S+/.test(req.body.useremail)) {
        return next(new ApiError(400, 'Email is not in correct format!' ));
    }
    if (!req.body.useraddress || typeof req.body.useraddress !== 'string') {
        return next(new ApiError(400, 'Address must be a string!' ));
    }
    if (!req.body.userpwd || req.body.userpwd.length < 8) {
        return next(new ApiError(400, 'Password must be at least 8 characters!' ));
    }
    try {
        // Kiểm tra xem email hoặc số điện thoại đã tồn tại hay chưa
        const checkExistEmail = await usersService.checkExistEmail(req.body.useremail);
        const checkExistPhone = await usersService.checkExistPhone(req.body.userphone);
        if (checkExistPhone || checkExistEmail) {
            return next(new ApiError(404,'Phone number or Email already exists!'));
        }
        const user = await usersService.createUser({
            ...req.body,
            useravatar: req.file ? `/public/uploads/${req.file.filename}`: null,
        });
        return res
                .status(201)
                .set({Location: `${req.baseUrl}/${user.id}`,})
                .json(JSend.success({user}));

    } catch (error) {
        return next(new ApiError(500, 'System error, please try again later.'));
    }
}

async function getUser(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401,'Please log in to see your information!'));
    }
    console.log(req.session.user.userid);
    const id = req.session.user.userid;
    if (!id) {
        return next(new ApiError(401, 'You need to log in to view user information.'));
    }
    const user = await usersService.getUserById(id);
    if (!user) {
        return next(new ApiError(404, 'User not found.'));
    }
    return res.json(JSend.success({ user }));
}

async function updateUser(req, res, next) {
    if (Object.keys(req.body).length === 0 && !req.file) {
        return next(new ApiError(400, 'Invalid update information.'));
    }
    if (!req.session.user) {
        return res.json(JSend.success('Please log in to perform this task!'));
    }
    const id = req.session.user.userid;
    try {
        const updated = await usersService.updateUser(id, {
            ...req.body,
            useravatar: req.file ? `/public/uploads/${req.file.filename}` : null,
        });

        if (!updated) {
            return next(new ApiError(400, `Unable to update the information of the user with the code ${id}`));
        }

        return res.json(JSend.success({ user: updated }));
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, 'System error, please try again later.'));
    }
}
async function deleteUser(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Please log in to perform this task!'));
    }
    try {
        const deleted = await usersService.deleteUser(req.session.user.userid);
        if (!deleted) {
            return next(new ApiError(404, 'Cannot delete user.'));
        }
        return res.json(JSend.success(`Successfully deleted user ${req.session.user.userid}`));
    } catch (error) {
        return next(new ApiError(500, 'System error, please try again later.'));
    }
}

module.exports = {
    login,
    logout,
    createUser,
    getUser,
    updateUser,
    deleteUser,
}