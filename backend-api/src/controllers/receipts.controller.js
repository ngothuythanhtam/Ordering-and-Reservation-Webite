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

// Verify Receipt Controller
async function staffVerifyReceipt(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: Bạn không có quyền chỉnh sửa thông tin này!'));
    }

    const { order_id } = req.params;
    const status = req.body.status; // Read directly from body

    if (!status) {
        return next(new ApiError(400, 'Chọn trạng thái để thay đổi!'));
    }

    if (!['Completed', 'Canceled'].includes(status)) {
        return next(new ApiError(400, 'Invalid status. Must be either "Completed" or "Canceled"'));
    }

    try {
        const result = await receiptsService.staffVerifyReceipt(order_id, userId, status);
        if (result && result.success) {
            return res.json(JSend.success({ message: 'Cập nhật trạng thái hóa đơn thành công!' }));
        } else {
            return next(new ApiError(404, 'Không tìm thấy hóa đơn nào!'));
        }
    } catch (error) {
        return next(new ApiError(400, error.message));
    }
}

async function staffGetReceiptsByFilter(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: Bạn không có quyền chỉnh sửa thông tin này!'));
    }

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
        result = await receiptsService.staffGetManyReceipts(req.query);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, 'An error occurred while retrieving receipts'));
    }
    return res.json(
        JSend.success({
            receipts: result.receipts,
            metadata: result.metadata,
        })
    );
}

async function staffGetReceipt(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: Bạn không có quyền chỉnh sửa thông tin này!'));
    }
    const { order_id } = req.params;
    console.log(order_id)

    if (!order_id) {
        return next(new ApiError(400, 'order_id is required'));
    }

    try {
        const receipt = await receiptsService.getReceiptById(order_id);

        if (!receipt) {
            return next(new ApiError(404, 'Receipt not found'));
        }

        return res.json(JSend.success({ receipt_info: receipt }));  
        
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, `Error retrieving receipt with order_id = ${order_id}`));
    }
}

module.exports = {
    createReceipt,
    addItemToReceipt,
    staffVerifyReceipt,
    staffGetReceiptsByFilter,
    staffGetReceipt,
}