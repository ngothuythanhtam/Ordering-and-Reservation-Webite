const receiptsService = require('../services/receipts.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function createReceipt(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401,'Vui lòng đăng nhập!'));
    }
    console.log(req.session.user.userid);
    const  id  = req.session.user.userid;
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
    if (!req.session.user) {
        return next(new ApiError(401,'Vui lòng đăng nhập!'));
    }
    const  id  = req.session.user.userid;
    if (!req.body.item_id || !req.body.quantity) {
        return next(new ApiError(400,'Thiếu thông tin món để thêm vào giỏ hàng'));
    }
    try {
        const checkExistItem = await receiptsService.checkExistItem(req.body.item_id);
        if (!checkExistItem) {
            return next(new ApiError(404,'Thêm món thất bại do món không tồn tại. Vui lòng chọn món khác'));
        }
        const addItem = await receiptsService.addItemToReceipt(id,req.body);
        return res
                .status(201)
                .json(JSend.success({addItem}));
    } 
    catch (error) {
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}
async function addReservation(req, res, next) {
    try {
        if (!req.session.user) return next(new ApiError(401,'Vui lòng đăng nhập để xem thông tin của bạn!'));
        const  id  = req.session.user.userid;
        
        if (!req.body) {
            return next(new ApiError(400, 'Thiếu thông tin đặt bàn hoặc ngày đặt bàn.'));
        }
        const checktable = await receiptsService.checktable(req.body.table_number, req.body.reservation_date);
        if (checktable) {
            return next(new ApiError(401, 'Bàn này đã được đặt bởi khách hàng khác hoặc không có sẵn!'));
        }
        //Kiểm tra người dùng có đang đặt bàn chưa
        const checkbookedtable = await receiptsService.getIDReser(id);
        if (checkbookedtable) {
            return next(new ApiError(401, 'Vui lòng xác nhận đơn đặt bàn vì bạn đã chọn bàn!')); 
        }
        const newReservation = await receiptsService.createReservation(id, req.body);
        return res.status(201).json(JSend.success('Đã thêm bàn thành công. Vui lòng xác nhận đơn!'));
    }
    catch (error) {
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}
async function deleteItemFromReceipt(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401,'Vui lòng đăng nhập!'));
    }
    console.log(req.session.user.userid);
    const  id  = req.session.user.userid;
    const { item_id } = req.body;
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

        //Tiến hành xóa món hàng
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
    if (!req.session.user) {
        return next(new ApiError(401, 'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }
    console.log(req.session.user.userid);
    const id = req.session.user.userid;
    
    try {
        // Kiểm tra xem người dùng có đơn đặt bàn đang pending không
        const reservationId = await receiptsService.getIDReser(id);
        console.log("Mã đặt bàn:",reservationId);
        if (reservationId) {
            // Kiểm tra xem bàn có sẵn không nếu có reservationId
            const tableInfo = await receiptsService.getIDtable(reservationId);
            if (!tableInfo) {
                return next(new ApiError(404, 'Không tìm thấy bàn liên quan đến đơn đặt của bạn!'));
            }
            console.log("Mã bàn: ",tableInfo);
            const tableAvailable = await receiptsService.checktableid(tableInfo.table_id,tableInfo.reservation_date);
            if (tableAvailable) {
                return next(new ApiError(401, 'Bàn này đã được đặt bởi khách hàng khác hoặc không có sẵn!'));
            }
            console.log("Kết quả kiểm tra bàn có sẵn:", tableAvailable);
        } else {
            // Nếu không có reservationId thì set reservation_id = null
            req.body.reservation_id = null;
        }
        const updated = await receiptsService.sttOrderCustomer(id, req.body);
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
    if (!req.session.user) {
        return next(new ApiError(401,'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }
    console.log(req.session.user.userid);
    const  id  = req.session.user.userid;
    try {
        const updated = await receiptsService.sttCancelCustomer(id,req.body);
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
        if (!req.session.user) {
            return next(new ApiError(401,'Vui lòng đăng nhập để xem thông tin của bạn!'));
        }
        console.log(req.session.user.userid);
        const  id  = req.session.user.userid;
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
async function getCart(req, res, next) {
    try {
        if (!req.session.user) {
            return next(new ApiError(401, 'Vui lòng đăng nhập để xem thông tin của bạn!'));
        }

        const id = req.session.user.userid;
        const result = await receiptsService.getPendingOrderWithDetails(id);

        if (!result) {
            return res.status(404).json({ status: 'fail', message: 'Không có đơn hàng đang chờ xử lý.' });
        }

        return res.status(200).json({
            status: 'success',
            receipt: result.receipt,
            reservation: result.reservation,
            items: result.items,
            table: result.table
        });
    }
    catch (error) {
        console.log(error);
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}

module.exports = {
    getCart,
    addReservation,
    createReceipt,
    addItemToReceipt,
    deleteItemFromReceipt,
    verifyCustomer,
    cancelCustomer,
    getReceiptsByFilter
}