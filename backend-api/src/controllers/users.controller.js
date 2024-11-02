const usersService = require('../services/users.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function login(req, res, next) {
    const { useremail, userpwd } = req.body;
    try {
        if (req.session && req.session.user && req.session.user.userid) {
            return res.json(JSend.success('Đã đăng nhập!'));
        }
        const checkExistEmail = await usersService.checkExistEmail(req.body.useremail);
        if (!checkExistEmail) {
            return next(new ApiError(404,'Bạn chưa có tài khoản. Vui lòng nhấn đăng ký.'));
        } 
        const user = await usersService.login(useremail, userpwd);
        req.session.user = {
            userid: user.userid,
            useremail: user.useremail,
            userrole: user.userrole,
        };
        console.log(req.session.user.userid);
        req.session.save(err => {
            if (err) return next(err);
            return res.status(200).json(JSend.success({ message: 'Đăng nhập thành công!' }));
        });
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
}
async function logout(req, res, next) {
    if (!req.session.user) {
        return res.json(JSend.success('Bạn chưa đăng nhập!'));
    }
    req.session.destroy((err) => {
        if (err) {
            return next(new ApiError(500, 'Lỗi khi đăng xuất, vui lòng thử lại.'));
        }
        res.clearCookie('connect.sid');

        return res.status(200).json(JSend.success({ message: 'Đăng xuất thành công!' }));
    });
}
async function createUser(req, res, next) {
    if (!req.body.userrole || !req.body.username || !req.body.userbirthday || !req.body.userphone || !req.body.useremail) {
        return next(new ApiError(400, 'Dữ liệu không hợp lệ' ));
    }
    if (isNaN(new Date(req.body.userbirthday))) {
        return next(new ApiError(400, 'Ngày sinh không phải là một ngày hợp lệ!' ));
    }
    if (typeof req.body.userphone !== 'string' || !/^\d{10}$/.test(req.body.userphone)) {
        return next(new ApiError(400, 'Số điện thoại phải là một chuỗi 10 số!' ));
    }
    if (typeof req.body.useremail !== 'string' || !/\S+@\S+\.\S+/.test(req.body.useremail)) {
        return next(new ApiError(400, 'Email không đúng định dạng!' ));
    }
    if (!req.body.useraddress || typeof req.body.useraddress !== 'string') {
        return next(new ApiError(400, 'Địa chỉ phải là một chuỗi!' ));
    }
    if (!req.body.userpwd || req.body.userpwd.length < 8) {
        return next(new ApiError(400, 'Mật khẩu phải có ít nhất 8 ký tự!' ));
    }
    try {
        // Kiểm tra xem email hoặc số điện thoại đã tồn tại hay chưa
        const checkExistEmail = await usersService.checkExistEmail(req.body.useremail);
        const checkExistPhone = await usersService.checkExistPhone(req.body.userphone);
        if (checkExistPhone || checkExistEmail) {
            return next(new ApiError(404,'Số điện thoại hoặc Email đã tồn tại!'));
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
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}

// async function getUser(req, res, next) {
//     const { id } = req.params;
//     try {
//         const user = await usersService.getUserById(id);
//         if (!user) {
//             return next(new ApiError(404,'Không tìm thấy người dùng.'));
//         }
//         return res.json(JSend.success({ user }));
//     } catch (error) {
//         return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
//     }
// }

async function getUser(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401,'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }
    console.log(req.session.user.userid);
    const id = req.session.user.userid;
    // Kiểm tra xem userid có tồn tại không
    if (!id) {
        return next(new ApiError(401, 'Bạn cần đăng nhập để xem thông tin người dùng.'));
    }
        // Lấy thông tin người dùng từ database
    const user = await usersService.getUserById(id);
    if (!user) {
        return next(new ApiError(404, 'Không tìm thấy người dùng.'));
    }
    return res.json(JSend.success({ user }));
}


async function updateUser(req, res, next) {
    if (Object.keys(req.body).length === 0 && !req.file) {
        return next(new ApiError(400, 'Thông tin cập nhật không hợp lệ.'));
    }
    if (!req.session.user) {
        return res.json(JSend.success('Vui lòng đăng nhập để thực hiện tác vụ này!'));
    }
    const { id } = req.session.user.userid;
    try {
        const updated = await usersService.updateUser(id, {
            ...req.body,
            useravatar: req.file ? `/public/uploads/${req.file.filename}` : null,
        });

        if (!updated) {
            return next(new ApiError(400, `Không thể cập nhật thông tin của người dùng có mã ${id}`));
        }

        return res.json(JSend.success({ user: updated }));
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}
async function deleteUser(req, res, next) {
    const { id } = req.params;
    const { requestId } = req.body; 

    try {
        const deleted = await usersService.deleteUser(id,{ requestId });
        if (!deleted) {
            return next(new ApiError(404, 'Không thể xóa người dùng.'));
        }
        return res.json(JSend.success(`Thành công xóa người dùng ${id}`));
    } catch (error) {
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}
async function updateUserToStaff(req, res, next) {
    const { id } = req.params; 
    const { userrole, requestId } = req.body; 

    try {
        const checkrole = await usersService.checkRole(id); 
        console.log('User role:', checkrole);
        if (checkrole != '3') {
            return next(new ApiError(403, 'Không có quyền thực hiện tác vụ này.' ));
        }
        const updated = await usersService.updateUserRole(id, requestId, userrole);
        if (updated && updated.success) { 
            return res.json(JSend.success(`Cập nhật thành công vai trò mới của người dùng có ID ${id}`));
        } else {
            return next(new ApiError(404,'Không có sự thay đổi ở tác vụ vừa rồi.'));
        }
    } catch (error) {
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}

module.exports = {
    login,
    logout,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateUserToStaff,
}