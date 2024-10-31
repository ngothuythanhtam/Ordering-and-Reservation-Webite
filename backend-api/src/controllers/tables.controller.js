const tablesService = require('../services/tables.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function createTable(req, res, next) {
    const { id } = req.params;
    if (!req.body.table_number || !req.body.seating_capacity) {
        return next(new ApiError(400,'Vui lòng điền đầy đủ thông tin.'));
    }
    try {
        const table = await tablesService.createTable(id,req.body);
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
    const { id } = req.params; 
    const { requestId } = req.body; 

    if (!requestId) {
        return next(new ApiError(400,'Yêu cầu nhập mã bàn.' ));
    }
    try {
        const deleted = await tablesService.deleteTable(id, requestId);
        if (!deleted) {
            return next(new ApiError(404, 'Không thể xóa bàn!')); 
        }
        else return res.json(JSend.success({ message: 'Xóa thành công.' }));
    } catch (error) {
        return next(new ApiError(500, 'Lỗi hệ thống, vui lòng thử lại sau.'));
    }
}
module.exports = {
    createTable,
    deleteTable
}