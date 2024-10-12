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
    // Handler for unknown URL path.
    // Call next() to pass to the error handling function.
    return next(new ApiError(404, 'Resource not found'));
}

function handleError(error, req, res, next) {
    // Centralized error handling function.
    if (res.headersSent) {
        return next(error); // Delegate to default Express error handler if headers are sent.
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    const errorCode = error.details?.code;

    // Error-specific responses
    switch (statusCode) {
        case 400:
            if (errorCode === 'INVALID_INPUT') {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "Invalid input. Please check the data and try again."
                });
            } else if (errorCode === 'DUPLICATE_ITEM_NAME') {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "Tên đã tồn tại, vui lòng chọn tên khác."
                });
            } else {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "Bad request, either invalid input or the item name already exists."
                });
            }
        case 404:
            return res.status(404).json({
                error: "Not Found",
                message: "The requested resource could not be found."
            });
        case 500:
            return res.status(500).json({
                error: "Internal Server Error",
                message: "An unexpected error occurred on the server. Please try again later."
            });
        default:
            // Default handling for other status codes
            return res.status(statusCode).json(
                statusCode >= 500 ? JSend.error(message) : JSend.fail(message)
            );
    }
}
module.exports = {
    methodNotAllowed,
    resourceNotFound,
    handleError,
};

