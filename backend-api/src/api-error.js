class ApiError extends Error {
    /**
     * Creates an instance of ApiError.
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {object} headers - Optional headers
     */
    constructor(statusCode, message, headers = {}) {
        super(message);
        this.statusCode = statusCode;
        this.headers = headers;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(msg) {
        return new ApiError(400, msg);
    }

    static notFound(msg) {
        return new ApiError(404, msg);
    }

    static internal(msg) {
        return new ApiError(500, msg);
    }
}

module.exports = ApiError;
