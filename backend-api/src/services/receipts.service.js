const knex = require('../database/knex');
const { fail } = require('../jsend');

function receiptRepository() {
    return knex('receipt');
}

function readReceipt(payload) {
    return {
        userid: payload.userid,
        staff_id: payload.staff_id,
        reservation_id: payload.reservation_id,
        order_date: payload.order_date,
        total_price: payload.total_price,
        status: payload.status,
    };
}

async function createReceipt(id, payload) {
    return await knex.transaction(async trx => {
        const receipt = readReceipt(payload);
        receipt.order_date = payload.order_date !== undefined ? payload.order_date : new Date().toISOString().split('T')[0];
        
        // Kiểm tra xem khách hàng có đang đặt bàn hay không
        const existingReservation = await trx('reservation')
            .where({
                userid: id,
                status: 'booked'
            })
            .first();

        // Nếu khách hàng đang đặt bàn thì thêm mã đơn đặt bàn vào hóa đơn
        receipt.reservation_id = existingReservation ? existingReservation.reservation_id : null;
        
        //Kiểm tra khách hàng có hóa đơn/giỏ hàng nào chưa thanh toán không
        receipt.userid = id;
        const existingOrder = await trx('receipt')
            .where({ 
                userid: id, 
                status: 'Pending' 
            })
            .first();
        if (existingOrder) return existingOrder;
        
        // Nếu chưa có, tạo một hóa đơn chưa thanh toán hoặc gọi là giỏ hàng mới
        const [newReceiptId] = await trx('receipt').insert(receipt);
        const newReceipt = await trx('receipt').where({ order_id: newReceiptId }).first();
        return newReceipt;
    });
}

async function addItemToReceipt(id, payload) {
    const { item_id, quantity } = payload;
    return await knex.transaction(async trx => {
        let user = await trx('receipt')
            .where({ 
                userid: id,
                status: 'Pending'
            })
            .first();
        if (!user) user = await createReceipt(id, payload); // This will now work

        const item = await trx('menu_items')
            .where({ 
                item_id: item_id,
            })
            .first();
            
        if (!item) {
            throw new Error("Item not found");
        }
        const item_price = item.item_price;
        const existingOrderItem = await trx('Order_Item')
            .where({ order_id: user.order_id, item_id: item_id })
            .first();

        if (existingOrderItem) {
            const newQuantity = parseInt(existingOrderItem.quantity, 10) + parseInt(quantity, 10);
            const updatedPrice = item_price * newQuantity;

            await trx('Order_Item')
                .where({ order_id: user.order_id, item_id: item_id })
                .update({
                    quantity: newQuantity, 
                    price: updatedPrice    
                });
            console.log('Updated quantity:', newQuantity);
            console.log('Updated price:', updatedPrice);
        } else {
            await trx('Order_Item').insert({
                order_id: user.order_id,
                item_id: item_id,
                quantity: quantity,
                price: item_price * quantity
            });
        }

        const total_price = await trx('Order_Item')
            .where('order_id', user.order_id) 
            .sum('price as total')
            .first();

        await trx('receipt')
            .where('order_id', user.order_id)
            .update({ total_price: total_price.total });

        return { success: true, message: 'Thêm vào giỏ hàng thành công!' };
    });
}
async function deleteItemFromReceipt(id, payload) {
    const { item_id, quantity } = payload;
    if (!item_id || !quantity) {
        throw new Error('Invalid payload: Missing item or quantity');
    }

    const updatedItem = await knex.transaction(async trx => {
        const receipt = await trx('receipt')
            .select('order_id', 'reservation_id')
            .where({ 
                userid: id,
                status: 'Pending'
            })
            .first();

        if (!receipt) {
            throw new Error('No pending receipt found for this user');
        }

        const order_id = receipt.order_id;
        console.log('Order ID:', order_id);

        const existingItem = await trx('order_item')
            .where({ order_id: order_id, item_id: item_id })
            .first();

        if (!existingItem) {
            throw new Error('Item not found in your receipt!!!');
        }

        console.log('Existing Item:', existingItem);

        const newQuantity = existingItem.quantity - quantity;

        if (newQuantity > 0) {
            const updatedPrice = (existingItem.price / existingItem.quantity) * newQuantity;
            await trx('order_item')
                .where({ order_id: order_id, item_id: item_id })
                .update({
                    quantity: newQuantity,
                    price: updatedPrice,
                });
        } else {
            await trx('order_item')
                .where({ order_id: order_id, item_id: item_id })
                .del();
        }

        const itemCount = await trx('order_item')
            .where('order_id', order_id)
            .count('* as count')
            .first();

        if (itemCount.count === 0 && receipt.reservation_id === null) {
            await trx('receipt').where('order_id', order_id).del();
            return { success: true, message: 'Receipt deleted as there are no items left.' };
        }

        const total_price = await trx('order_item')
            .where('order_id', order_id)
            .sum('price as total')
            .first();

        await trx('receipt')
            .where('order_id', order_id)
            .update({ total_price: total_price.total });

        return { success: true, message: 'Item updated or deleted from receipt successfully' };
    });

    return updatedItem;
}

async function sttOrderCustomer(id, payload) {
    const { status } = payload;
    const updatedStatus = await knex.transaction(async trx => {
        console.log(id, status);
        const receipt = await trx('receipt')
            .select('order_id')
            .where({ 
                userid: id,
                status: 'Pending'
            })
            .first();
        if (!receipt) {
            const error = new Error('No pending receipt found for this user');
            error.statusCode = 404; 
            throw error;
        }
        console.log('Status to update:', status);
        const result = await trx('receipt')
            .where({ order_id: receipt.order_id })
            .update({status});
        if (result === 0) throw new Error('No changes made.');
        return {
            success: true,
            message: `Receipt status updated to ${status}`,
            order_id: receipt.order_id
        };
    });
    return updatedStatus;
}
async function sttCancelCustomer(id, payload) {
    const { status } = payload;
    const updatedStatus = await knex.transaction(async trx => {
        console.log(id, status);
        const receipt = await trx('receipt')
            .select('order_id')
            .where({ 
                userid: id,
                status: 'Ordered'
            })
            .first();
        if (!receipt) {
            const error = new Error('No pending receipt found for this user');
            error.statusCode = 404;
            throw error;
        }
        const result = await trx('receipt')
            .where({ order_id: receipt.order_id })
            .update({ status });
        if (result === 0)throw new Error('No changes made.');
        return {
            success: true,
            message: `Receipt status updated to ${status}`,
            order_id: receipt.order_id
        };
    });
    return updatedStatus;
}
// async function sttCompleteCustomer(id, payload) {
//     const { status, order_id, date } = payload;
//     const updatedStatus = await knex.transaction(async trx => {
//         const staff = await trx('users')
//             .where({ 
//                 userid: id,
//                 userrole: 2
//             })
//             .first();
//         if(!staff) throw new Error('No Permission.');
//         const receipt = await trx('receipt')
//             .select('order_id')
//             .where({
//                 order_id: order_id,
//                 status: 'Ordered'
//             })
//             .first();
//         if (!receipt) {
//             throw new Error('No pending receipt found for this user');
//         }
//         const result = await trx('receipt')
//             .where({ order_id: receipt.order_id })
//             .update({ status });
//         if (result === 0)throw new Error('No changes made.');
//         return {
//             success: true,
//             message: `Receipt status updated to ${status}`,
//             order_id: receipt.order_id
//         };
//     });
//     return updatedStatus;
// }
module.exports = {
    createReceipt,
    addItemToReceipt,
    deleteItemFromReceipt,
    sttOrderCustomer,
    sttCancelCustomer,
    // sttCompleteCustomer
}