const receiptsService = require('../../services/Staff/receipts.service');
const usersService = require('../../services/Customer/users.service');
const ApiError = require('../../api-error');
const JSend = require('../../jsend');

async function staffVerifyReceipt(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Please log in'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: You do not have permission to edit this information!'));
    }

    const { order_id } = req.params;
    const status = req.body.status; // Read directly from body

    if (!status) {
        return next(new ApiError(400, 'Select status to change!'));
    }

    if (!['Completed', 'Canceled'].includes(status)) {
        return next(new ApiError(400, 'Invalid status. Must be either "Completed" or "Canceled"'));
    }

    try {
        const result = await receiptsService.staffVerifyReceipt(order_id, userId, status);
        if (result && result.success) {
            return res.json(JSend.success({ message: 'Update invoice status successfully!' }));
        } else {
            return next(new ApiError(404, 'No receipts found!'));
        }
    } catch (error) {
        return next(new ApiError(400, error.message));
    }
}

async function staffGetReceiptsByFilter(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Please log in!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: You do not have permission to edit this information!'));
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
        return next(new ApiError(401, 'Please log in!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: You do not have permission to edit this information!'));
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
    staffVerifyReceipt,
    staffGetReceiptsByFilter,
    staffGetReceipt,
}