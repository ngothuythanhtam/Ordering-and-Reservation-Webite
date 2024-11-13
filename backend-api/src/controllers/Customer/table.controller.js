const tableService = require('../../services/Customer/table.service');
const ApiError = require('../../api-error');
const JSend = require('../../jsend');

async function getTableByFilter(req, res, next) {
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
        result = await tableService.getManyTableByStatus(req.query);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while retrieving tables'));
    }

    return res.json(
        JSend.success({
            items: result.tables,
            metadata: result.metadata,
    }));
}
module.exports = {
    getTableByFilter
};
