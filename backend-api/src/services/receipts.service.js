const knex = require('../database/knex');
const { fail } = require('../jsend');
const Paginator = require('./paginator');
const bcrypt = require('bcrypt');
function receiptRepository() {
    return knex('receipt');
}
const checkExistIteminCart = async (order_id,id) => {
    const exist = await knex('order_item')
        .where({order_id: order_id, item_id: id })
        .first();
    return exist;
};
const checkExistItem = async (id) => {
    const item = await knex('menu_items').where({ item_id: id }).select('item_id').first();
    return item ? item.item_id : null;
};

const getIDReceipt_Pending = async (userid) => {
    const order = await knex('receipt')
        .where({ 
            userid: userid,
            status: 'Pending'
        })
        .select('order_id')
        .first();
    return order ? order.order_id : null;
};
const getIDReser = async (userid) => {
    const reserv = await knex('receipt')
        .where({ 
            userid: userid,
            status: 'Pending'
        })
        .select('reservation_id')
        .first();
    return reserv ? reserv.reservation_id : null;
};
const getIDtable = (id) => 
    knex('reservation')
        .select('table_id')
        .where({ reservation_id: id })
        .first();

const checktableid = (id) => 
    knex('restaurant_table')
        .where({ table_id:id, status: 'available' })
        .first();

const checktable = (table_number) => 
    knex('restaurant_table')
        .where({ table_number, status: 'available' })
        .first();

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
        //Kiểm tra khách hàng có hóa đơn/giỏ hàng nào chưa thanh toán không
        receipt.userid = id;
        const existingOrder = await trx('receipt')
            .where({ 
                userid: id, 
                status: 'Pending' 
            })
            .first();
        if (existingOrder) return existingOrder;
        
        // Nếu chưa có thì tạo một hóa đơn chưa thanh toán hoặc gọi là giỏ hàng mới
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
        if (!user) user = await createReceipt(id, payload);
        const item = await trx('menu_items')
            .where({ 
                item_id: item_id,
            })
            .first();
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
    const updatedItem = await knex.transaction(async trx => {
        const receipt = await trx('receipt')
            .select('order_id', 'reservation_id')
            .where({ 
                userid: id,
                status: 'Pending'
            })
            .first();
        if (!receipt) return null;
        const order_id = receipt.order_id;
        console.log('Order ID:', order_id);
        const existingItem = await trx('order_item')
            .where({ order_id: order_id, item_id: item_id })
            .first();

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
            return { success: true, message: 'Không có mặt hàng nào trong giỏ hàng.' };
        }

        const total_price = await trx('order_item')
            .where('order_id', order_id)
            .sum('price as total')
            .first();

        await trx('receipt')
            .where('order_id', order_id)
            .update({ total_price: total_price.total });

        return { success: true, message: 'Cập nhật thành công' };
    });
    return updatedItem;
}
async function createReservation(id,payload) {
    return knex.transaction(async trx => {
        // Kiểm tra người dùng có receipt đang pending không, không thì tạo mới
        let receipt = await trx('receipt').where({ 
                    userid: id,
                    status: 'Pending'
                })
            .first();
        if (!receipt) receipt = await createReceipt(id, payload);
        
        //Kiểm tra bàn có tồn tại không
        const table = await knex('restaurant_table')
                .select('table_id', 'table_number', 'seating_capacity', 'status')
                .where({ table_number: payload.table_number })
                .first();
        if (!table) throw new Error('Table not found');
        if (table.status !== 'available') throw new Error('Table is not available');     
        //Tạo đơn đặt bàn mới và cập nhật vào giỏ hàng
        const [newReservationId] = await trx('reservation').insert({
            userid: id,
            table_id: table.table_id,
            reservation_date: payload.reservation_date,
            special_request: payload.special_request || null,
            status: 'booked'
        }, ['reservation_id']); // Trả về reservation_id
        await trx('receipt')
            .where({
                userid: id,
                status: 'Pending'}
            )
            .update({ reservation_id : newReservationId});
        return [newReservationId];
    });
}
async function sttOrderCustomer(id, payload) {
    const { status } = payload;
    const updatedStatus = await knex.transaction(async trx => {
        console.log(id, status);
        const receipt = await trx('receipt').where({ 
                userid: id,
                status: 'Pending'
            }).first();
        if (!receipt) return null;
        const getIDtable =  await knex('reservation')
            .where({ reservation_id: receipt.reservation_id})
            .first();
        
        await knex('restaurant_table')
            .where({ table_id: getIDtable.table_id})
            .update({ status: 'reserved' });
        await trx('reservation')
            .where({ reservation_id: receipt.reservation_id })
            .update({ status: 'confirmed' });
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
            .where({ 
                userid: id,
                status: 'Ordered'
            })
            .first();
        if (!receipt) return null;
        if (receipt.reservation_id) {
            // Cập nhật trạng thái của reservation thành 'canceled'
            await trx('reservation')
                .where({ reservation_id: receipt.reservation_id })
                .update({ status: 'canceled' });
            const updateRes = await trx('reservation')
                .where({ reservation_id: receipt.reservation_id }).first();
            await trx('restaurant_table')
                .where({ table_id: updateRes.table_id })
                .update({ status: 'available' });
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
async function getManyReceipts(id, query) {
    const { status, page = 1, limit = 5 } = query;
    const { userid }= id;
    const paginator = new Paginator(page, limit);
    
    if (!userid) {
        return null;
    }
    let results = await receiptRepository()
        .where((builder) => {
            if (['Pending', 'Ordered', 'Completed', 'Canceled'].includes(status)) {
                builder.where('status', status);
            }
            if (userid) {
                builder.where('userid', userid);
            }
        })
        .select(
            knex.raw('count(order_id) OVER() AS recordCount'),
            'order_id',
            'userid',
            'staff_id',
            'reservation_id',
            'order_date',
            'total_price',
            'status'
        )
        .limit(paginator.limit)
        .offset(paginator.offset);
    let totalRecords = 0;
    results = results.map((result) => {
        totalRecords = result.recordCount;
        delete result.recordCount;
        return result;
    });
    return {
        metadata: paginator.getMetadata(totalRecords),
        receipts: results,
    };
}

module.exports = {
    checktable,
    checktableid,
    getIDReser,
    getIDtable,
    getIDReceipt_Pending,
    checkExistIteminCart,
    checkExistItem,
    createReceipt,
    addItemToReceipt,
    createReservation,
    deleteItemFromReceipt,
    sttOrderCustomer,
    sttCancelCustomer,
    getManyReceipts,
    // sttCompleteCustomer
}