const tableService = require('../services/table.service');
const usersService = require('../services/users.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function getTable(req, res, next) {
    const { table_id } = req.params;  

    if (!table_id) {
        return next(new ApiError(400, 'Table number is required'));
    }

    try {
        const table = await tableService.getTableById(table_id);  
        if (!table) {
            return next(new ApiError(404, 'Table not found'));
        }
        return res.json(JSend.success({ table_info: table }));  
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, `Error retrieving item with table_number=${table_number}`));
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
            return next(new ApiError(403, 'Forbidden: You do not have permission to add menu items', { code: 'FORBIDDEN' }));
        }

        const { id } = req.params;
        if (!req.body.table_number || !req.body.seating_capacity) {
            return next(new ApiError(400,'Vui lòng điền đầy đủ thông tin.'));
        }
        const existingTable = await tableService.getTableByNumber(req.body.table_number);
        if (existingTable) {
            return next(new ApiError(400, 'Table number already exists. Please choose a different number.', { code: 'DUPLICATE_ITEM_NAME' }));
        }

        const table = await tableService.createTable(req.body);
        return res
                .status(201)
                .json(JSend.success({table}));

    } 
    catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Lỗi khi tạo bàn mới!'));
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
            return next(new ApiError(403, 'Forbidden: You do not have permission to add menu items', { code: 'FORBIDDEN' }));
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
        // Pass query parameters (e.g., item_name, item_type, item_status) for filtering
        result = await tableService.getManyTables(req.query);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while retrieving tables'));
    }

    return res.json(
        JSend.success({
            tables: result.tables,
            metadata: result.metadata,
        })
    );
}

module.exports = {
    getTable,
    createTable,
    deleteTable,
    getManyTablesByFilter,
};
