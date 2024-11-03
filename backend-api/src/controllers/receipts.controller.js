const receiptsService = require('../services/receipts.service');
const usersService = require('../services/users.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function createReceipt(req, res, next) {
    const { id } = req.params; 
    if (!id || !req.body.order_date) {
        return next(new ApiError(400,'Thông tin nhập không hợp lệ.'));
    }
    try {
        const receiptPayload = {
            reservation_id: req.body.reservation_id || null, 
            order_date: req.body.order_date,
        };
        const receipt = await receiptsService.createReceipt(id, receiptPayload);
        return res
                .status(201)
                .json(JSend.success({receipt}));
    } 
    catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}

async function addItemToReceipt(req, res, next) {
    if (!req.body.item_id ||
        !req.body.quantity || !req.params.id) {
        return next(new ApiError(400,'Thiếu thông tin món để thêm vào giỏ hàng'));
    }
    try {
        const checkExistItem = await receiptsService.checkExistItem(req.body.item_id);
        if (!checkExistItem) {
            return next(new ApiError(404,'Thêm món thất bại do món không tồn tại. Vui lòng chọn món khác'));
        }
        const addItem = await receiptsService.addItemToReceipt(req.params.id,req.body);
        return res
                .status(201)
                .json(JSend.success({addItem}));
    } 
    catch (error) {
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}
async function deleteItemFromReceipt(req, res, next) {
    const { id } = req.params;
    const { item_id, quantity } = req.body;
    try {
        // Kiểm tra xem khách hàng có hóa đơn chưa
        const getIDReceipt_Pending = await receiptsService.getIDReceipt_Pending(id);
        if (!getIDReceipt_Pending) {
            return next(new ApiError(404, 'Khách hàng chưa có hóa đơn nào.'));
        }

        // Kiểm tra xem món hàng có trong giỏ hàng không
        const checkExistIteminCart = await receiptsService.checkExistIteminCart(getIDReceipt_Pending, item_id);
        if (!checkExistIteminCart) {
            return next(new ApiError(404, 'Món không có trong giỏ hàng.'));
        }

        // Nếu tất cả các kiểm tra đều ổn, tiến hành xóa món hàng
        const deleted = await receiptsService.deleteItemFromReceipt(id, req.body);
        if (!deleted) {
            return next(new ApiError(400, 'Xóa thất bại'));
        }
        return res.json(JSend.success(deleted));
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}
async function verifyCustomer(req, res, next) {
    const { id } = req.params;

    const regularObject = JSON.parse(JSON.stringify(req.body)); 

    try {
        const updated = await receiptsService.sttOrderCustomer(id, regularObject);
        console.log(updated);

        if (updated && updated.success) {
            return res.json(JSend.success({ message: 'Đặt đơn thành công' }));
        } else {
            return next(new ApiError(404, 'Không thể đặt đơn.'));
        }

    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}

async function cancelCustomer(req, res, next) {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updated = await receiptsService.sttCancelCustomer(id, {status});
        console.log(status)
        if (updated && updated.success) {
            return res.json(JSend.success({ message: 'Hủy đơn thành công!' }));
        } else {
            return next(new ApiError(404, 'Không thể hủy đơn'));
        }

    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
} 

async function getReceiptsByFilter(req, res, next) {
    let result = {
        receipts: [],
        metadata: {
            totalRecords: 0,
            firstPage: 1,
            lastPage: 1,
            page: 1,
            limit: 5,
        }
    };
    
    try {
        const { id } = req.params;
        result = await receiptsService.getManyReceipts({ userid: id }, req.query);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
    return res.json(
        JSend.success({
            receipts: result.receipts,
            metadata: result.metadata,
        })
    );
}

// Verify Receipt Controller
async function verifyReceipt(req, res, next) {
    // Kiểm tra nếu session không tồn tại hoặc không có userid
    if (!req.session.user) {
        return next(new ApiError(401, 'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }
    console.log(req.session.user.userid);

    // Lấy userID từ session
    const userId = req.session.user.userid;

    // Kiểm tra vai trò người dùng
    const userRole = await usersService.checkRole(userId);
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: You do not have permission to add menu items', { code: 'FORBIDDEN' }));
    }

    const { order_id } = req.params;
    const staffId = userId;
    try {
        // Call the service function
        const result = await receiptsService.verifyReceipt(order_id, staffId);
        if (result && result.success) {
            return res.json(JSend.success({ message: 'Receipt verified and updated successfully!' }));
        } else {
            return next(new ApiError(404, 'Receipt not found'));
        }
    } catch (error) {
        return next(new ApiError(400, error.message));
    }
}

module.exports = {
    createReceipt,
    addItemToReceipt,
    deleteItemFromReceipt,
    verifyCustomer,
    cancelCustomer,
    getReceiptsByFilter,
    verifyReceipt
}