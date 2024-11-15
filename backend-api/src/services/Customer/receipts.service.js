const knex = require('../../database/knex');
const Paginator = require('./paginator');

//Kiểm tra món có trong Cart chưa
const checkExistIteminCart = async (order_id,id) => {
    const exist = await knex('order_item')
        .where({order_id: order_id, item_id: id })
        .first();
    return exist;
};
//Kiểm tra món có trong trong menu không
const checkExistItem = async (id) => {
    const item = await knex('menu_items').where({ item_id: id }).select('item_id').first();
    return item ? item.item_id : null;
};
//Lấy ORDER_ID đang xử lý(Giỏ Hàng) nếu không trả về null
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
//Lấy MÃ RESERVATION của Giỏ Hàng nếu không có đặt bàn trả về null
const getIDReser = async (userid) => {
    const reserv = await knex('receipt')
        .where({ 
            userid: userid,
            status: 'Pending'
        })
        .first();
    return reserv ? reserv.reservation_id : null;
};
//Lấy MÃ BÀN của Giỏ Hàng nếu không có đặt bàn trả về null
const getIDtable = (id) => 
    knex('reservation')
        .where({ reservation_id: id })
        .first();
//Kiểm tra BÀN có trống không bằng table_id
const checktableid = (table_id, reservation_date) => 
    knex('reservation')
        .join('restaurant_table', 'reservation.table_id', 'restaurant_table.table_id')
        .where({
            'restaurant_table.table_id': table_id,
            'reservation.reservation_date': reservation_date
        })
        .andWhere('reservation.status', 'confirmed') // Kiểm tra bàn có trạng thái 'confirmed'
        .first();
const checktable = (table_number, reservation_date) => 
    knex('reservation')
        .join('restaurant_table', 'reservation.table_id', 'restaurant_table.table_id')
        .leftJoin('receipt', 'reservation.reservation_id', 'receipt.reservation_id') // Liên kết với bảng receipt để kiểm tra trạng thái
        .where({
            'restaurant_table.table_number': table_number,
            'reservation.reservation_date': reservation_date
        })
        .andWhere('reservation.status', 'confirmed') // Kiểm tra bàn đã được đặt (booked)
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
//Hàm tạo Giỏ hàng trống nếu có rồi trả về Giỏ hàng hiện tại
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
//Hàm thêm món vào giỏ hàng
async function addItemToReceipt(id, payload) {
    const { item_id, quantity } = payload;
    return await knex.transaction(async trx => {
        //Kiểm tra người dùng có giỏ hàng nào chưa
        let user = await trx('receipt')
            .where({ 
                userid: id,
                status: 'Pending'
            })
            .first();
        //Nếu CHƯA, tạo giỏ hàng mới
        if (!user) user = await createReceipt(id, payload);
        //Nếu CÓ, lấy thông tin món:
        const item = await trx('menu_items')
            .where({ 
                item_id: item_id,
            })
            .first();
        const item_price = item.item_price;
        //Kiểm tra món có trong giỏ hàng chưa
        const existingOrderItem = await trx('Order_Item')
            .where({ order_id: user.order_id, item_id: item_id })
            .first();
        
        //Cập nhật lại giá món và số lượng món nếu có món trong giỏ hàng
        if (existingOrderItem) {
            const newQuantity = parseInt(existingOrderItem.quantity, 10) + parseInt(quantity, 10);
            const updatedPrice = item_price * newQuantity;

            await trx('Order_Item')
                .where({ order_id: user.order_id, item_id: item_id })
                .update({
                    quantity: newQuantity, 
                    price: updatedPrice    
                });
        //Thêm món vào giỏ nếu chưa có
        } else {
            await trx('Order_Item').insert({
                order_id: user.order_id,
                item_id: item_id,
                quantity: quantity,
                price: item_price * quantity
            });
        }
        //Tính tổng hóa đơn sau khi được cập nhập món
        const total_price = await trx('Order_Item')
            .where('order_id', user.order_id) 
            .sum('price as total')
            .first();
        //Cập nhật tổng tiền vào hóa đơn
        await trx('receipt')
            .where('order_id', user.order_id)
            .update({ total_price: total_price.total });

        return { success: true, message: 'Added to cart successfully!' };
    });
}
//Xóa món khỏi giỏ hàng
async function deleteItemFromReceipt(id, payload) {
    const { item_id, quantity } = payload;
    const updatedItem = await knex.transaction(async trx => {
        //Kiểm tra có giỏ hàng không
        const receipt = await trx('receipt')
            .select('order_id', 'reservation_id')
            .where({ 
                userid: id,
                status: 'Pending'
            })
            .first();
        if (!receipt) return null;
        const order_id = receipt.order_id;
            
        //Kiểm tra món có tồn tại trong giỏ hàng không
        const existingItem = await trx('order_item')
            .where({ order_id: order_id, item_id: item_id })
            .first();
        //Tính số lượng cần cập nhật
        const newQuantity = existingItem.quantity - quantity;
        //Kiểm tra nếu còn thì giảm
        if (newQuantity > 0) {
            const updatedPrice = (existingItem.price / existingItem.quantity) * newQuantity;
            await trx('order_item')
                .where({ order_id: order_id, item_id: item_id })
                .update({
                    quantity: newQuantity,
                    price: updatedPrice,
                });
        //Khách hàng giảm còn 0 thì xóa món
        } else {
            await trx('order_item')
            .where({ order_id: order_id, item_id: item_id })
            .del();
        }
        //Đếm số lượng món trong hóa đơn
        const itemCount = await trx('order_item')
            .where('order_id', order_id)
            .count('* as count')
            .first();
        if (itemCount.count === 0 && receipt.reservation_id === null) {
            await trx('receipt').where('order_id', order_id).del();
            return { success: true, message: 'There are no items in the cart.' };
        }
        //Cập nhật tổng số tiền
        const total_price = await trx('order_item')
            .where('order_id', order_id)
            .sum('price as total')
            .first();
        await trx('receipt')
            .where('order_id', order_id)
            .update({ total_price: total_price.total });

        return { success: true, message: 'Updated successfully' };
    });
    return updatedItem;
}
async function createReservation(id, payload) {
    return knex.transaction(async trx => {
        // Kiểm tra người dùng có receipt đang pending không, không thì tạo mới
        let receipt = await trx('receipt')
            .where({ 
                userid: id,
                status: 'Pending'
            })
            .first();
        
        if (!receipt) receipt = await createReceipt(id, payload);
        
        // Kiểm tra bàn có tồn tại không
        const table = await trx('restaurant_table')
            .select('table_id', 'table_number', 'seating_capacity')
            .where({ table_number: payload.table_number })
            .first();
        
        if (!table) throw new Error('Table not found');
        
        // Kiểm tra xem bàn có được đặt vào ngày mong muốn không
        const existingReservation = await trx('reservation')
            .where({
                table_id: table.table_id,
                reservation_date: payload.reservation_date
            })
            .andWhereNot({ status: 'canceled' }) // Loại bỏ các đặt bàn đã hủy
            .first();
        
        if (existingReservation) {
            // Nếu đã có đặt bàn, kiểm tra trạng thái của reservation và receipt
            const existingReceipt = await trx('receipt')
                .where({
                    reservation_id: existingReservation.reservation_id
                })
                .first();

            if (existingReservation.status === 'confirmed' && existingReceipt.status === 'Ordered') {
                throw new Error('Table is already confirmed and the order has been placed, it cannot be booked again.');
            }
        }
        // Tạo đơn đặt bàn mới và cập nhật vào giỏ hàng
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
                status: 'Pending'
            })
            .update({ reservation_id: newReservationId });

        return [newReservationId];
    });
}
async function sttOrderCustomer(id, payload) {
    const { status } = payload;
    const updatedStatus = await knex.transaction(async trx => {
        console.log(id, status);
        // Tìm giỏ hàng đang xử lý
        const receipt = await trx('receipt')
            .where({ 
                userid: id,
                status: 'Pending'
            }).first();
        if (!receipt) return null;
        
        if (receipt.reservation_id) {
            // Nếu có đặt bàn, kiểm tra thông tin bàn và cập nhật trạng thái bàn
            const getIDtable = await trx('reservation')
                .where({ reservation_id: receipt.reservation_id })
                .first();

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
    const updatedStatus = await knex.transaction(async trx => {
        //Kiểm tra đơn có order_id có phải đã đặt chưa
        const receipt = await trx('receipt')
            .where({ 
                userid: id,
                status: 'Ordered',
                order_id: payload.order_id
            })
            .first();
        if (!receipt) return null;
        if (receipt.reservation_id) {
            // Cập nhật trạng thái của reservation thành 'canceled' nếu có đơn đặt bàn
            await trx('reservation')
                .where({ reservation_id: receipt.reservation_id})
                .update({ status: 'canceled' });
        }
        const result = await trx('receipt')
            .where({ order_id: receipt.order_id })
            .update({ status: payload.status });
        if (result === 0)throw new Error('No changes made.');
        return {
            success: true,
            message: `Receipt status updated to ${payload.status}`,
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

    // Khởi tạo câu truy vấn đếm tất cả đơn của khách hàng
    const countQuery = knex('receipt')
        .countDistinct('receipt.order_id as totalRecords')
        .where('receipt.userid', userid)
        .modify(builder => {
            if (['Pending', 'Ordered', 'Completed', 'Canceled'].includes(status)) {
                builder.where('receipt.status', status);
            }
        });

    // Lấy tất cả thông tin đơn hàng của khách hàng
    let results = await knex('receipt')
        .select([
            'receipt.order_id',
            'receipt.userid',
            'receipt.staff_id',
            'receipt.order_date',
            'receipt.total_price',
            'receipt.status',
            'receipt.reservation_id',
            'reservation.reservation_date',
            'reservation.special_request',
            'reservation.status as reservation_status',
            'restaurant_table.table_id',
            'restaurant_table.table_number',
            'restaurant_table.seating_capacity',
            'Order_Item.item_id',
            'menu_items.item_name',
            'Order_Item.price as item_price',
            'Order_Item.quantity',
            knex.raw('COALESCE(Order_Item.price * Order_Item.quantity, 0) as item_total_price')
        ])
        .leftJoin('reservation', 'receipt.reservation_id', 'reservation.reservation_id')
        .leftJoin('restaurant_table', 'reservation.table_id', 'restaurant_table.table_id')
        .leftJoin('Order_Item', 'receipt.order_id', 'Order_Item.order_id')
        .leftJoin('menu_items', 'Order_Item.item_id', 'menu_items.item_id')
        .where('receipt.userid', userid)
        .modify(builder => {
            if (['Pending', 'Ordered', 'Completed', 'Canceled'].includes(status)) {
                builder.where('receipt.status', status);
            }
        })
        .orderBy('receipt.order_date', 'desc')
        .limit(paginator.limit)
        .offset(paginator.offset);

    const [{ totalRecords }] = await countQuery;

    const groupedReceipts = {};

    results.forEach(result => {
        if (!groupedReceipts[result.order_id]) {
            // Khởi tạo đối tượng receipt mới
            groupedReceipts[result.order_id] = {
                order_id: result.order_id,
                userid: result.userid,
                staff_id: result.staff_id,
                order_date: result.order_date,
                total_price: result.total_price,
                status: result.status,
                items: [],
            };

            // Thêm thông tin reservation nếu có
            if (result.reservation_id) {
                groupedReceipts[result.order_id].reservation = {
                    reservation_id: result.reservation_id,
                    reservation_date: result.reservation_date,
                    special_request: result.special_request,
                    status: result.reservation_status
                };

                // Thêm thông tin bàn nếu có reservation
                if (result.table_id) {
                    groupedReceipts[result.order_id].table = {
                        table_id: result.table_id,
                        table_number: result.table_number,
                        seating_capacity: result.seating_capacity,
                    };
                }
            }
        }
        // Thêm item vào danh sách nếu có
        if (result.item_id) {
            const orderItem = {
                item_id: result.item_id,
                item_name: result.item_name,
                item_price: result.item_price,
                quantity: result.quantity,
                item_total_price: result.item_total_price
            };
            groupedReceipts[result.order_id].items.push(orderItem);
        }
    });
    const finalResults = Object.values(groupedReceipts);

    return {
        metadata: paginator.getMetadata(totalRecords),
        receipts: finalResults,
    };
}
//Hàm lấy thông tin Giỏ hàng
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
    getPendingOrderWithDetails
}