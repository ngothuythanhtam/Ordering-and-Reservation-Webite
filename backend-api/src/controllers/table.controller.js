const tableService = require('../services/table.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function getTableByNumber(req, res, next) {
    const { table_number } = req.query;  

    if (!table_number) {
        return next(new ApiError(400, 'Table number is required'));
    }

    try {
        const table = await tableService.getTableByNumber(table_number);  
        if (!table) {
            return next(new ApiError(404, 'Table not found'));
        }
        return res.json(JSend.success({ table_info: table }));  
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, `Error retrieving item with table_number=${table_number}`));
    }
}

async function getTableBySeating(req, res, next) {
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
        // Pass query parameters (e.g., seating_capacity) for filtering
        result = await tableService.getTableBySeating(req.query);
    } catch (error) {
        console.error(error);

        if (error instanceof ApiError) {
            // Return specific error using JSend.fail
            return res.status(error.statusCode).json(JSend.fail({ message: error.message }));
        }

        // For other errors, use a generic error message
        return next(new ApiError(500, 'An error occurred while retrieving tables'));
    }

    return res.json(
        JSend.success({
            tables: result.tables,
            metadata: result.metadata,
        })
    );
}
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
            tables: result.tables,
            metadata: result.metadata,
        })
    );
}

async function updateTableStatus(req, res, next) {
    const { table_number } = req.params; 
    const { status: newStatus } = req.body; 

    if (!table_number || !newStatus) {
        return next(new ApiError(400, 'Table number and new status are required'));
    }

    try {
        const table = await tableService.getTableByNumber(table_number);

        if (!table) {
            return next(new ApiError(404, 'Table not found'));
        }

        table.status = newStatus;
        await tableService.updateTable(table);

        return res.json(
            JSend.success({
                message: `Table ${table_number} status updated to ${newStatus}`,
                table
            })
        );
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while updating table status'));
    }
}

module.exports = {
    getTableByNumber,
    getTableBySeating,
    getTableByFilter,
    updateTableStatus,
};
