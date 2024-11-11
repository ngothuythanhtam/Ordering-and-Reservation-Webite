const tableService = require('../services/table.service');
const usersService = require('../services/users.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function getTable(req, res, next) {
    const { table_id } = req.params;  

    if (!table_id) {
        return next(new ApiError(400, 'Table number là bắt buộc'));
    }

    try {
        const table = await tableService.getTableById(table_id);  
        if (!table) {
            return next(new ApiError(404, 'Không tìm thấy bàn!'));
        }
        return res.json(JSend.success({ table_info: table }));  
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}

async function createTable(req, res, next) {
    // Kiểm tra nếu session không tồn tại hoặc không có userid
    if (!req.session.user) {
        return next(new ApiError(401,'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }
    console.log(req.session.user.userid);

    // Lấy userID từ session
    const userId  = req.session.user.userid;
    
    try {
        // Kiểm tra vai trò người dùng
        const userRole = await usersService.checkRole(userId);
        if (userRole !== 2  ) {
            return next(new ApiError(403, 'Forbidden: Bạn không có quyền để thêm bàn mới!', { code: 'FORBIDDEN' }));
        }

        const { id } = req.params;
        if (!req.body.table_number || !req.body.seating_capacity) {
            return next(new ApiError(400,'Vui lòng điền đầy đủ thông tin.'));
        }
        const existingTable = await tableService.getTableByNumber(req.body.table_number);
        if (existingTable) {
            return next(new ApiError(400, 'Tên bàn đã tồn tại. Vui lòng nhập tên khác!', { code: 'DUPLICATE_ITEM_NAME' }));
        }

        const table = await tableService.createTable(req.body);
        return res
                .status(201)
                .json(JSend.success({table}));

    } 
    catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}

async function deleteTable(req, res, next) {
    // Kiểm tra nếu session không tồn tại hoặc không có userid
    if (!req.session.user) {
        return next(new ApiError(401,'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }
    console.log(req.session.user.userid);

    // Lấy userID từ session
    const userId  = req.session.user.userid;

    try {
        // Kiểm tra vai trò người dùng
        const userRole = await usersService.checkRole(userId);
        if (userRole !== 2  ) {
            return next(new ApiError(403, 'Forbidden: Bạn không có quyền để xóa bàn!', { code: 'FORBIDDEN' }));
        }

        const { table_id } = req.params; 

        if (!table_id) {
            return next(new ApiError(400,'Yêu cầu nhập id bàn.' ));
        }

        const deleted = await tableService.deleteTable(table_id);
        if (!deleted) {
            return next(new ApiError(404, 'Không thể xóa bàn!')); 
        }
        else return res.json(JSend.success({ message: 'Xóa thành công.' }));
    } catch (error) {
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}

async function getManyTablesByFilter(req, res, next) {
    let result = {
        tables: [],
        metadata: {
            totalRecords: 0,
            firstPage: 1,
            lastPage: 1,
            page: 1,
            limit: 5,
        }
    };

    try {
        result = await tableService.getManyTables(req.query);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }

    return res.json(
        JSend.success({
            tables: result.tables,
            metadata: result.metadata,
        })
    );
}

async function updateTable(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }

    const userId = req.session.user.userid;
    const { table_id } = req.params;
    const status = req.body.status;

    try {
        const userRole = await usersService.checkRole(userId);
        if (userRole !== 2) {
            return next(new ApiError(403, 'Forbidden: Bạn không có quyền chỉnh sửa thông tin này!', { code: 'FORBIDDEN' }));
        }

        const result = await tableService.updateTable(table_id, status);
        if (result && result.success) {
            return res.json({ success: true, message: result.message });
        } else {
            return next(new ApiError(404, 'Không tìm thấy bàn!'));
        }
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}


module.exports = {
    getTable,
    createTable,
    deleteTable,
    getManyTablesByFilter,
    updateTable,
};
