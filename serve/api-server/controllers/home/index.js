module.exports = function(req, res, next) {
    req.resContent = "Api server running.";
    req.resStatus = 200;
    return next();
};
