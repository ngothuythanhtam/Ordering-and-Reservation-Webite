const tableService = require('../services/table.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function getTableByNumber(req, res, next) {
    const { table_number } = req.query;  // Retrieve 'table_number' from query parameters

    if (!table_number) {
        return next(new ApiError(400, 'Table number is required'));
    }

    try {
        const table = await tableService.getTableByNumber(table_number);  // Use the table_number to find the item
        if (!table) {
            return next(new ApiError(404, 'Table not found'));
        }
        return res.json(JSend.success({ table_info: table }));  // Return the found table
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
        // Pass query parameters (e.g., item_name, item_type, item_status) for filtering
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
    const { table_number } = req.params; // Get table number from path params
    const { status: newStatus } = req.body; // Get new status from form data

    // Validate inputs
    if (!table_number || !newStatus) {
        return next(new ApiError(400, 'Table number and new status are required'));
    }

    try {
        // Fetch the table by number
        const table = await tableService.getTableByNumber(table_number);

        // Check if table exists
        if (!table) {
            return next(new ApiError(404, 'Table not found'));
        }

        // Update the table's status
        table.status = newStatus;
        await tableService.updateTable(table);

        // Send success response
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
