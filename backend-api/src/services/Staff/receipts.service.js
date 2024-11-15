const knex = require('../../database/knex');
const Paginator = require('./receipt.paginator');

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

async function staffVerifyReceipt(order_id, staffId, status) {
  const order_id_int = parseInt(order_id, 10);
  const receiptData = await receiptRepository().where({ order_id: order_id_int }).first();
  console.log(receiptData)
  
  if (!receiptData) throw new Error('No receipts found!');

  const receipt = readReceipt(receiptData);
  
  try {
    // Hóa đơn ở trạng thái Ordered mới được xác nhận
    if (receipt.status !== 'Ordered') {
      throw new Error('Cannot confirm if receipt has not been Ordered!');
    }

    // Xác nhật trạng thái hóa đơn "Hủy" hoặc "Hoàn thành"
    await knex.transaction(async (trx) => {
      await trx('receipt')
        .where({ order_id })
        .update({ 
          status: status,
          staff_id: staffId
        });

      if (receipt.reservation_id) {
        const reservationDetails = await trx('restaurant_table')
          .join('reservation', 'restaurant_table.table_id', 'reservation.table_id')
          .join('receipt', 'reservation.reservation_id', 'receipt.reservation_id')
          .where('receipt.order_id', order_id)
          .select('restaurant_table.table_id', 'reservation.reservation_id')
          .first();

        if (reservationDetails) {
          const { table_id, reservation_id } = reservationDetails;

          // Khi hóa đơn được cập nhật trạng thái cũng cập nhật trjang thái đơn đặt bàn
          if (reservation_id) {
            await trx('reservation')
              .where({ reservation_id })
              .update({ status: status });
          }
        }
      }
      await trx.commit();
    });

    return { success: true, message: `Receipt status updated as ${status} successfully!` };
  } catch (error) {
    console.error("Error when changing receipt status:", error);
    throw new Error(error.message);
  }
}

async function staffGetManyReceipts(query) {
    const { userid, page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);
    
    let results = await receiptRepository()
        .where((builder) => {
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

async function getReceiptById(order_id, trx = null) {
    console.log('Looking for receipt with order_id:', order_id); // Debug log

    try {
        // Lấy chi tiết hóa đơn
        const receiptQuery = receiptRepository()
            .where('receipt.order_id', order_id)
            .select(
                'receipt.order_id',
                'receipt.userid',
                'receipt.staff_id',
                'receipt.reservation_id',
                'receipt.order_date',
                'receipt.total_price',
                'receipt.status',
                'users.username as user_name',
                'staff.username as staff_name',
                'restaurant_table.table_number'
            )
            .leftJoin('users as users', 'users.userid', 'receipt.userid')
            .leftJoin('users as staff', 'staff.userid', 'receipt.staff_id')
            .leftJoin('reservation', 'reservation.reservation_id', 'receipt.reservation_id')
            .leftJoin('restaurant_table', 'restaurant_table.table_id', 'reservation.table_id');

        // Thực thi truy vấn trong transaction nếu có
        const receipt = trx ? await receiptQuery.transacting(trx).first() : await receiptQuery.first();

        if (!receipt) {
            console.log('No receipt found for order_id:', order_id); // Log khi không có hóa đơn nào trùng khớp
            return {
                status: 'fail',
                message: 'Receipt not found'
            };
        }

        console.log('Receipt found:', receipt); // Log the receipt if found

        // Lấy chi tiết món ăn bằng order_id
        const orderItemsQuery = receiptRepository()
            .from('order_item')
            .where('order_item.order_id', order_id)
            .select(
                'order_item.order_item_id',
                'order_item.quantity',
                'order_item.price',
                'menu_items.item_id',
                'menu_items.item_name',
                'menu_items.item_price'
            )
            .join('menu_items', 'order_item.item_id', 'menu_items.item_id');

        // Thực thi truy vấn trong transaction nếu có
        const orderItems = trx ? await orderItemsQuery.transacting(trx) : await orderItemsQuery;

        // Thêm danh sách món ăn vào hóa đơn
        receipt.order_items = orderItems;
        return receipt;

    } catch (error) {
        console.error('Error fetching receipt by order_id:', error);
        throw new Error('Error fetching receipt by order_id');
    }
}

module.exports = {
    staffVerifyReceipt,
    staffGetManyReceipts,
    getReceiptById,
}