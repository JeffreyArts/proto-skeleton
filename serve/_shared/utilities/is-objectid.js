
module.exports = string => {
    const reg = new RegExp("^[0-9a-fA-F]{24}$");
    return reg.test(string)
};
