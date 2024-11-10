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
        .first();
    return reserv ? reserv.reservation_id : null;
};
const getIDtable = (id) => 
    knex('reservation')
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
        // Tìm hóa đơn của khách hàng với trạng thái 'Pending'
        const receipt = await trx('receipt')
            .where({ 
                userid: id,
                status: 'Pending'
            }).first();
        if (!receipt) return null;
        
        if (receipt.reservation_id) {
            // Nếu có reservation_id, kiểm tra thông tin bàn và cập nhật trạng thái bàn
            const getIDtable = await trx('reservation')
                .where({ reservation_id: receipt.reservation_id })
                .first();

            const tableAvailable = await trx('restaurant_table')
                .where({ table_id: getIDtable.table_id })
                .first();
            console.log('Updating table status:', getIDtable.table_id);
            console.log('Reservation ID:', receipt.reservation_id);
            if (!tableAvailable || tableAvailable.status !== 'available') {
                throw new Error('Bàn không có sẵn.');
            }

            const tableUpdateResult = await trx('restaurant_table')
                .where({ table_id: getIDtable.table_id })
                .update({ status: 'reserved' });
            console.log('Table update result:', tableUpdateResult);

            // Cập nhật trạng thái đơn đặt
            const reservationUpdateResult = await trx('reservation')
                .where({ reservation_id: receipt.reservation_id })
                .update({ status: 'confirmed' });
            console.log('Reservation update result:', reservationUpdateResult);
        } else {
            // Nếu không có reservation_id, đặt giá trị reservation_id = null
            receipt.reservation_id = null;
        }

        // Cập nhật trạng thái của hóa đơn
        const result = await trx('receipt')
            .where({ order_id: receipt.order_id })
            .update({ status });
        
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
    const { userid } = id;
    const paginator = new Paginator(page, limit);

    if (!userid) {
        return null;
    }

    // Khởi tạo câu truy vấn đếm tổng số hóa đơn 
    // trong lịch sử giao dịch của khách hàng qua các trạng thái
    const countQuery = knex('receipt')
        .countDistinct('receipt.order_id as totalRecords')
        .leftJoin('reservation', 'receipt.reservation_id', 'reservation.reservation_id')
        .leftJoin('restaurant_table', 'reservation.table_id', 'restaurant_table.table_id')
        .leftJoin('Order_Item', 'receipt.order_id', 'Order_Item.order_id')
        .where((builder) => {
            if (['Pending', 'Ordered', 'Completed', 'Canceled'].includes(status)) {
                builder.where('receipt.status', status);
            }
            if (userid) {
                builder.where('receipt.userid', userid);
            }
        });

    // Lấy tất cả thông tin của từng hóa đơn của người dùng
    let results = await knex('receipt')
        .leftJoin('reservation', 'receipt.reservation_id', 'reservation.reservation_id')
        .leftJoin('restaurant_table', 'reservation.table_id', 'restaurant_table.table_id')
        .leftJoin('Order_Item', 'receipt.order_id', 'Order_Item.order_id')
        .leftJoin('menu_items', 'Order_Item.item_id', 'menu_items.item_id')
        .where((builder) => {
            if (['Pending', 'Ordered', 'Completed', 'Canceled'].includes(status)) {
                builder.where('receipt.status', status);
            }
            if (userid) {
                builder.where('receipt.userid', userid);
            }
        })
        .limit(paginator.limit)
        .offset(paginator.offset);

    //Thực thi truy vấn đếm tổng số hóa đơn
    const [{ totalRecords }] = await countQuery;

    //Nhóm các order items theo hóa đơn bằng đối tượng
    const groupedReceipts = {};

    results.forEach(result => {
        const orderItem = {
            item_id: result.item_id,
            item_name: result.item_name,
            item_price: result.item_price,
            quantity: result.quantity,
            item_total_price: result.item_total_price
        };

        if (!groupedReceipts[result.order_id]) {
            groupedReceipts[result.order_id] = {
                order_id: result.order_id,
                userid: result.userid,
                staff_id: result.staff_id,
                order_date: result.order_date,
                total_price: result.total_price,
                status: result.status,
                table: {
                    table_id: result.table_id,
                    table_number: result.table_number,
                    seating_capacity: result.seating_capacity,
                    table_status: result.table_status
                },
                items: [orderItem]
            };
        } else {
            groupedReceipts[result.order_id].items.push(orderItem);
        }
    });

    // Chuyển đổi đối tượng groupedReceipts thành một mảng
    const finalResults = Object.values(groupedReceipts);

    return {
        metadata: paginator.getMetadata(totalRecords),
        receipts: finalResults,
    };
}
async function getPendingOrderWithDetails(userid) {
    const pendingReceipt = await knex('receipt')
        .where({
            userid: userid,
            status: 'Pending'
        })
        .first();

    if (!pendingReceipt) {
        return null; // No pending order
    }

    // Fetch reservation details if reservation_id exists
    const reservationDetails = pendingReceipt.reservation_id 
        ? await knex('reservation').where({ reservation_id: pendingReceipt.reservation_id }).first()
        : null;

    // Fetch order items
    const orderItems = await knex('Order_Item')
        .join('menu_items', 'Order_Item.item_id', 'menu_items.item_id')
        .where('Order_Item.order_id', pendingReceipt.order_id);

    if (pendingReceipt.reservation_id) {
        const { table_id } = await knex('reservation')
            .select('table_id') // Use 'table_id' here
            .where({ reservation_id: pendingReceipt.reservation_id })
            .first();

        const detailTable = await knex('restaurant_table')
            .where({ table_id: table_id })
            .first();

        return {
            receipt: pendingReceipt,
            reservation: reservationDetails,
            items: orderItems,
            table: detailTable
        };
    }
    return {
        receipt: pendingReceipt,
        reservation: reservationDetails,
        items: orderItems
    };
}
const getReceiptById = async (id, order_id) => {
    // Lấy thông tin hóa đơn dựa trên order_id và userid
    const receipt = await knex('receipt')
        .where({ userid: id, order_id: order_id })
        .first();
    if (!receipt) {
        return null; // Không tìm thấy hóa đơn với order_id này
    }
    // Lấy chi tiết bàn từ reservation (nếu có reservation_id)
    const reservationDetails = receipt.reservation_id 
        ? await knex('reservation').where({ reservation_id: receipt.reservation_id }).first()
        : null;
    // Lấy chi tiết các món hàng trong hóa đơn
    const orderItems = await knex('Order_Item')
        .join('menu_items', 'Order_Item.item_id', 'menu_items.item_id')
        .select('Order_Item.quantity', 'Order_Item.price', 'menu_items.item_name')
        .where('Order_Item.order_id', receipt.order_id);

    // Trả về chi tiết hóa đơn, đặt bàn (nếu có) và danh sách các món hàng
    return {
        receipt: receipt,
        reservation: reservationDetails,
        items: orderItems
    };
};
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
    getPendingOrderWithDetails,
    getReceiptById
}