/* global requireShared, requireApi */

const Account = requireShared("models/account");


// Validators
const hasPassword = requireApi("validators/object/hasPassword");
const hasEmail = requireApi("validators/object/hasEmail");
const doesNotExists = requireApi("validators/account/doesNotExists");


module.exports = (req, res, next) => {

    const newAccount = req.body;

    Promise.all([
        hasPassword(newAccount),
        hasEmail(newAccount),
        doesNotExists(newAccount)
    ])
  .then(() => {
      Account.create(newAccount)
    .then(storedAccount => {
        delete storedAccount.hashedPassword;
        delete storedAccount.salt;


        req.resStatus = 201;
        req.resContent = storedAccount;
        return next();
    })
    .catch(() => {
        err = new Error("databaseError");
        req.resStatus = 500;
        req.error = err;
        return next();
    });
  })
  .catch(err => {
      req.resStatus = 406;
      req.error = err;
      
      return next();
  });
};
