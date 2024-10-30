const ApiError = require('../api-error'); 
const JSend = require('../jsend'); 

function methodNotAllowed(req, res, next) { 
    if (req.route) { 
    // Determine which HTTP methods are supported 
        const httpMethods = Object.keys(req.route.methods) 
            .filter((method) => method !== '_all') 
            .map((method) => method.toUpperCase()); 
        return next( 
            new ApiError(405, 'Method Not Allowed', { 
                Allow: httpMethods.join(', '), 
            }) 
        ); 
    } 
    return next(); 
} 
function resourceNotFound(req, res, next) { 
    return next(new ApiError(404, 'Resource not found')); 
} 
function handleError(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.statusCode || 500;
    const headers = error.headers || {};
    let message = error.message || 'Lỗi server';

    const errorMessages = {
        400: 'Bad Request',
        404: 'Not Found',
        500: 'Internal Server Error'
    };

    message = errorMessages[statusCode] || message;
    res.set(headers);
    return res
        .status(statusCode)
        .json(
            statusCode >= 500 ? JSend.error(message) : JSend.fail(message)
        );
}

module.exports = { 
    methodNotAllowed, 
    resourceNotFound, 
    handleError, 
};
