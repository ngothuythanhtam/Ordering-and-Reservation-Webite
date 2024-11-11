const knex = require('../database/knex');
const Paginator = require('./paginator');
const {unlink} = require('node:fs')
const ApiError = require('../api-error');

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
            throw new Error('Không có người dùng trùng khớp với email đã nhập!');
        }

        // Lấy thông tin bàn từ số bàn được nhập
        const table = await trx('restaurant_table')
            .select('table_id', 'table_number', 'seating_capacity', 'status')
            .where({ table_number })
            .first();

        if (!table) {
            throw new Error('Không có bàn trùng khớp với số bàn đã nhập!');
        }

        // Insert dữ liệu mới vào reservation
        const [newReservationId] = await trx('reservation').insert({
            userid: user.userid,
            table_id: table.table_id,
            reservation_date: reservationData.reservation_date,
            special_request: reservationData.special_request || null,
            status: 'booked'  // Khi đặt bàn thì trạng thái đơn là booked
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
                status: 'booked',
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
        console.error("Có lỗi khi tạo mới reservation:", error);
        throw new Error(error.message || "Không thể tạo đơn đặt bàn");
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
