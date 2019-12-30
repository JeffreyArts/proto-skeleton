/* global requireShared */

const Account = requireShared("models/account");

module.exports = function(req, res, next) {

    if (req.error) {
        return next();
    }

    const accountId = req.params.accountId;

    Account.delete(accountId)
    .then(deletedAccount => {
        req.resStatus = 201;
        req.resContent = deletedAccount;
        return next();
    })
      .catch(err => {
          req.resStatus = 406;
          req.error = err;
          return next();
      });
};
