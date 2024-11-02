const ApiError = require('../api-error');
function authMiddleware(req, res, next) {
    if (!req.session.user) {
        return next(
            new ApiError(
                401, 
                'Bạn cần đăng nhập để thực hiện tác vụ này.'
            )
        );
    }
    next();
}
module.exports = authMiddleware;