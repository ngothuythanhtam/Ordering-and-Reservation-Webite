const knex = require('../../database/knex');
const Paginator = require('./paginator');
const receiptService = require('../../services/Customer/users.service');

function reservationRepository() {
    return knex('reservation');
}

async function staffCreateReservation(useremail, table_number, reservationData) {
    const trx = await knex.transaction();
    try {
        // Lấy thông tin user từ email dược nhập
        const user = await trx('users')
            .select('userid', 'username', 'useremail', 'userphone')
            .where({ useremail })
            .first();

        // Nếu không tìm thấy user thông báo lỗi
        if (!user) {
            throw new Error('There are no users matching the email entered!');
        }

        // Lấy thông tin bàn từ số bàn được nhập
        const table = await trx('restaurant_table')
            .select('table_id', 'table_number', 'seating_capacity')
            .where({ table_number })
            .first();

        if (!table) {
            throw new Error('There are no tables matching the table number entered!');
        }

        // Kiểm tra xem bàn có được đặt vào ngày mong muốn không
        const existingReservation = await trx('reservation')
            .where({
                table_id: table.table_id,
                reservation_date: reservationData.reservation_date
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
      

        // Insert dữ liệu mới vào reservation
        const [newReservationId] = await trx('reservation').insert({
            userid: user.userid,
            table_id: table.table_id,
            reservation_date: reservationData.reservation_date,
            special_request: reservationData.special_request || null,
            status: 'confirmed'
        });

        // Đồng thời khi đặt bàn thành công, receipt cũng được tạo ra
        const [newReceiptId] = await trx('receipt').insert({
            userid: user.userid,
            reservation_id: newReservationId,
            order_date: trx.fn.now(),
            status: 'Ordered'
        });

        // Nếu tất cả các quy trình được thực hiện thành công thì commit giao dịch
        await trx.commit();

        // Trả về và hiển thị thông tin đã được cập nhật
        return {
            reservation: {
                reservation_id: newReservationId,
                reservation_date: reservationData.reservation_date,
                special_request: reservationData.special_request || null,
                status: 'confirmed',
                user: {
                    username: user.username,
                    useremail: user.useremail,
                },
            },
            receipt: {
                receipt_id: newReceiptId,
                order_date: new Date(),
                status: 'Ordered'
            }
        };

    } catch (error) {
        // Rollback giao dịch nếu 1 trong các quy trình không thành công
        await trx.rollback();
        console.error("There was an error when creating a new reservation:", error);
        throw new Error(error.message || "Unable to create table reservation");
    }
}
 
async function getReservationById(reservation_id, trx = null) {
    const query = reservationRepository()
        .where('reservation_id', reservation_id)
        .select(
            '*', 
            'restaurant_table.table_number',
            'users.username',
            'users.useremail',
            'users.userphone'
        )
        .join('restaurant_table', 'restaurant_table.table_id','reservation.table_id' )
        .join('users', 'users.userid', 'reservation.userid');
    return trx ? query.transacting(trx).first() : query.first();
} 

async function getManyReservations(query) {
    const { userid, page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);
    
    let results = await reservationRepository()
        .where((builder) => {
            if (userid) {
                builder.where('userid', userid);
            }
        })
        .select(
            knex.raw('count(reservation_id) OVER() AS recordCount'),
            'reservation_id',
            'userid',
            'table_id',
            'reservation_date',
            'special_request',
            'create_at',
            'status',
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
        reservations: results,
    };
}

module.exports = {
    getReservationById,
    getManyReservations,
    staffCreateReservation,
};
