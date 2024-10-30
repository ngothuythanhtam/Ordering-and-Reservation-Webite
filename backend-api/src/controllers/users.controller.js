const usersService = require('../services/users.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function createUser(req, res, next) {
    if (!req.body.userrole || !req.body.username || !req.body.userbirthday || !req.body.userphone || !req.body.useremail) {
        return res.status(400).json(JSend.fail({ message: 'Dữ liệu không hợp lệ' }));
    }
    if (isNaN(new Date(req.body.userbirthday))) {
        return res.status(400).json(JSend.fail({ message: 'Ngày sinh không phải là một ngày hợp lệ!' }));
    }
    if (typeof req.body.userphone !== 'string' || !/^\d{10}$/.test(req.body.userphone)) {
        return res.status(400).json(JSend.fail({ message: 'Số điện thoại phải là một chuỗi 10 số!' }));
    }
    if (typeof req.body.useremail !== 'string' || !/\S+@\S+\.\S+/.test(req.body.useremail)) {
        return res.status(400).json(JSend.fail({ message: 'Email không đúng định dạng!' }));
    }
    if (!req.body.useraddress || typeof req.body.useraddress !== 'string') {
        return res.status(400).json(JSend.fail({ message: 'Địa chỉ phải là một chuỗi!' }));
    }
    if (!req.body.userpwd || req.body.userpwd.length < 8) {
        return res.status(400).json(JSend.fail({ message: 'Mật khẩu phải có ít nhất 8 ký tự!' }));
    }
    try {
        // Kiểm tra xem email hoặc số điện thoại đã tồn tại hay chưa
        const checkExistEmail = await usersService.checkExistEmail(req.body.useremail);
        const checkExistPhone = await usersService.checkExistPhone(req.body.userphone);
        if (checkExistPhone || checkExistEmail) {
            return res.status(404).json(JSend.fail({ message: 'Số điện thoại hoặc Email đã tồn tại!' }));
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
        console.error(error);
        return next(
            new ApiError(500)
        );
    }
}

async function getUser(req, res, next) {
    const { id } = req.params;
    try {
        const user = await usersService.getUserById(id);
        if (!user) {
            return res.status(404).json(JSend.fail({ message: 'Không tìm thấy người dùng.' }))
        }
        return res.json(JSend.success({ user }));
    } catch (error) {
        return res.status(500).json(JSend.fail({ message: 'Lỗi kết nối server.' }));
    }
}

async function updateUser(req, res, next) {
    if (Object.keys(req.body).length === 0 && !req.file) {
        return next(new ApiError(400));
    }
    const { id } = req.params;
    try {
        const updated = await usersService.updateUser(id, {
            ...req.body,
            useravatar: req.file ? `/public/uploads/${req.file.filename}` : null,
        });

        if (!updated) {
            return next(new ApiError(404));
        }

        return res.json(JSend.success({ user: updated }));
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Không thể cập nhật thông tin của người dùng có mã ${id}`));
    }
}
async function deleteUser(req, res, next) {
    const { id } = req.params;
    const { requestId } = req.body; 

    try {
        const deleted = await usersService.deleteUser(id,{ requestId });
        if (!deleted) {
            return next(new ApiError(404,'Không tìm thấy người dùng'));
        }
        return res.json(JSend.success());
    } catch (error) {
        console.log(error);
        return next(new ApiError(500));
    }
}
async function updateUserToStaff(req, res, next) {
    const { id } = req.params; 
    const { userrole, requestId } = req.body; 
    console.log('Request body:', req.body);

    try {
        const updated = await usersService.updateUserRole(id, requestId, userrole);
        if (updated && updated.success) { 
            return res.json(JSend.success({ message: 'Đã cập nhật vai trò mới của một người dùng.' }));
        } else {
            return next(new ApiError(404, 'User not found or no changes made.'));
        }
    } catch (error) {
        console.log(error);
        return next(new ApiError(500));
    }
}

module.exports = {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateUserToStaff,
}