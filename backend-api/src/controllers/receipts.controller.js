const receiptsService = require('../services/receipts.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function createReceipt(req, res, next) {
    const { id } = req.params; 
    if (!id || !req.body.order_date) {
        return res.status(400);
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
        return next(
            new ApiError(500)
        );
    }
}
async function addItemToReceipt(req, res, next) {
    if (!req.body.item_id ||
        !req.body.quantity || !req.params.id) {
        return res.status(400).json(JSend.error("Missing required fields: order_id, item_id, quantity, and price"));
    }
    try {
        const addItem = await receiptsService.addItemToReceipt(req.params.id,req.body);
        return res
                .status(201)
                .json(JSend.success({addItem}));
    } 
    catch (error) {
        console.error(error);
        return next(
            new ApiError(500)
        );
    }
}
async function deleteItemFromReceipt(req, res, next) {
    const { id } = req.params;
    try {
        const deleted = await receiptsService.deleteItemFromReceipt(id, req.body);
        if (!deleted) {
            return next(new ApiError(404));
        }
        return res.json(JSend.success());
    } catch (error) {
        console.log(error);
        return next(new ApiError(500));
    }
}
async function verifyCustomer(req, res, next) {
    const { id } = req.params;

    const regularObject = JSON.parse(JSON.stringify(req.body)); 
    console.log(regularObject);

    try {
        const updated = await receiptsService.sttOrderCustomer(id, regularObject);
        console.log(updated);

        if (updated && updated.success) {
            return res.json(JSend.success({ message: 'Verify Successfully' }));
        } else {
            return next(new ApiError(404, 'No changes made.'));
        }

    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Internal Server Error'));
    }
}

async function cancelCustomer(req, res, next) {
    const { id } = req.params;
    const { status } = req.body;
    console.log(status)
    try {
        const updated = await receiptsService.sttCancelCustomer(id, {status});
        console.log(status)
        if (updated && updated.success) {
            return res.json(JSend.success({ message: 'Cancel Successfully' }));
        } else {
            return next(new ApiError(404, 'No changes made.'));
        }

    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Internal Server Error'));
    }
} 
// async function verifyStaff(req, res, next) {
//     const { id } = req.params;

//     try {
//         const updated = await receiptsService.sttCompleteCustomer(id, req.body);
//         console.log(updated);

//         if (updated && updated.success) {
//             return res.json(JSend.success({ message: 'Verify Successfully' }));
//         } else {
//             return next(new ApiError(404, 'No changes made.'));
//         }

//     } catch (error) {
//         console.error(error);
//         return next(new ApiError(500, 'Internal Server Error'));
//     }
// }
module.exports = {
    createReceipt,
    addItemToReceipt,
    deleteItemFromReceipt,
    verifyCustomer,
    cancelCustomer,
    // verifyStaff
}