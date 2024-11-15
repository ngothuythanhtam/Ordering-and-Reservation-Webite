const tableService = require('../../services/Staff/table.service');
const usersService = require('../../services/Customer/users.service');
const ApiError = require('../../api-error');
const JSend = require('../../jsend');

async function getTable(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Please log in!!'));
    }

    const userId = req.session.user.userid;
    console.log('userid:', userId);
   
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        console.log("staffid: ", userId)
        return next(new ApiError(403, 'Forbidden:  You do not have permission to edit this information!'));
    }
    const { table_id } = req.params;  

    if (!table_id) {
        return next(new ApiError(400, 'Table number is required'));
    }

    try {
        const table = await tableService.getTableById(table_id);  
        if (!table) {
            return next(new ApiError(404, 'No table found!'));
        }
        return res.json(JSend.success({ table_info: table }));  
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'System error, please try again later.'));
    }
}

async function createTable(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401,'Please log in!'));
    }
    console.log(req.session.user.userid);

    const userId  = req.session.user.userid;
    
    try {
        const userRole = await usersService.checkRole(userId);
        if (userRole !== 2  ) {
            return next(new ApiError(403, 'Forbidden: You do not have permission to add new tables!', { code: 'FORBIDDEN' }));
        }

        const { id } = req.params;
        if (!req.body.table_number || !req.body.seating_capacity) {
            return next(new ApiError(400,'Please fill in all information.'));
        }
        const existingTable = await tableService.getTableByNumber(req.body.table_number);
        if (existingTable) {
            return next(new ApiError(400, 'Table name already exists. Please enter another name!', { code: 'DUPLICATE_ITEM_NAME' }));
        }

        const table = await tableService.createTable(req.body);
        return res
                .status(201)
                .json(JSend.success({table}));

    } 
    catch (error) {
        console.error(error);
        return next(new ApiError(500, 'System error, please try again later.'));
    }
}

async function deleteTable(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401,'Please log in!'));
    }
    console.log(req.session.user.userid);

    const userId  = req.session.user.userid;

    try {
        const userRole = await usersService.checkRole(userId);
        if (userRole !== 2  ) {
            return next(new ApiError(403, 'Forbidden: You do not have permission', { code: 'FORBIDDEN' }));
        }

        const { table_id } = req.params; 

        if (!table_id) {
            return next(new ApiError(400,'Requires entry of table id.' ));
        }

        const deleted = await tableService.deleteTable(table_id);
        if (!deleted) {
            return next(new ApiError(404, 'Can not delete!')); 
        }
        else return res.json(JSend.success({ message: 'Delete Successfully.' }));
    } catch (error) {
        return next(new ApiError(500, 'System error, please try again later.'));
    }
}

async function getManyTablesByFilter(req, res, next) {
    if (!req.session.user) {
        
        return next(new ApiError(401, 'Please log in!'));
    }

    const userId = req.session.user.userid;
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        console.log("staffid: ", userId)
        return next(new ApiError(403, 'Forbidden: You do not have permission'));
    }
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
        return next(new ApiError(500, 'System error, please try again later.'));
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
