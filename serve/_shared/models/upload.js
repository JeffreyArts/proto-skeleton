/* global requireShared */

const moment        = require("moment");
const db            = requireShared("utilities/db");
const collection    = db.get("uploads");

const Upload = {
    save: function(fileObject) {
        fileObject.created = moment.utc().unix();
        return collection.insert(fileObject);
    },
    load: function(imageId) {
        return collection.findOne({_id: imageId})
    }
};

module.exports = Upload;