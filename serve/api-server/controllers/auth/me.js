
module.exports = function(req, res, next) {
    if (req.error) {
        return next();
    }
    req.resStatus = 201;
    req.resContent = req.user;
    return next();
};
