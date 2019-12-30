/* global requireShared */

const Upload = requireShared("models/upload");
const isObjectid = requireShared("utilities/is-objectid");
const _ = require("lodash");
const fs = require("fs");
const gm = require("gm").subClass({imageMagick: true});
const mkdirp = require("mkdirp");
const mime = require('mime-types');

module.exports = function(req, res) {

    const imageId = req.params.imageId;
    let size = req.query.size || "1000x1000";
    size = size.split("x");

    if (size.length != 2) {
        size = null;
    }

    const createDirIfNotExists = path => new Promise((resolve, reject) => {
        if (!fs.existsSync(path)) {
            mkdirp(path, err => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        } else {
            return resolve();
        }
    })

    const createOrLoadImage = (originalImage, size) => new Promise((resolve, reject) => {
        const path = `${originalImage.split("/")[0]}/images/${size[0]}x${size[1]}`;
        let filename = originalImage.split("/")[1];

        if (originalImage.indexOf(".") > 0) {
            const tmp = originalImage.split("/");
            filename = tmp[tmp.length-1];
        }

        const fullpath = `${path}/${filename}`;

        if (_.isNull(size)) {
            return resolve(originalImage);
        }

        if (!fs.existsSync(`${path}/${filename}`)) {
            gm(originalImage).resize(size[0], size[1], "^")
                .gravity("Center")
                .autoOrient()
                .crop(size[0], size[1])
                .write(fullpath, err => {
                    if (err) {
                        return reject(err)
                    }
                    return resolve(fullpath);
                });
        } else {
            resolve(fullpath);
        }
    })

    const returnImage = o => {
        Promise.all([
            createDirIfNotExists(`${o.path.split("/")[0]}/images/${size[0]}x${size[1]}`),
            createOrLoadImage(o.path, size)
        ])
            .then(
                result => {
                    res.status(200);
                    res.sendFile(result[1], {
                        root: "./",
                        headers: {
                            "Content-Disposition": `inline;filename="${o.originalname}"`,
                            "Content-Type": o.mimetype,
                            "Content-Length": o.size
                        }
                    });
                }
            )
            .catch(err => {
                console.error(err);
                res.status(500);
                res.json({
                    errorCode: "brokenImage"
                });
            });
    }

    if (isObjectid(imageId)) {
        console.log(imageId, "imageId");
        Upload.load(imageId)
            .then(returnImage)
            .catch(err => {
                console.error(err);
                res.status(500);
                res.json({
                    errorCode: "notFound"
                });
            });
    } else {
        res.status(500);
        res.json({
            errorCode: "notFound"
        });
    }

};
