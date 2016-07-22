var bodyParser = require('body-parser');
var multer = require('multer');
var swaggerParse = require('../parser.js');
var fs = require("fs");
var yaml = require('yamljs');
var _ = require('lodash');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
var upload = multer({
    storage: storage
});
var type = upload.single('avatar');
var fileUpload = function (req, res) {
    res.contentType('application/json');
    console.log('files', req.file);
    fs.readFile(req.file.path, "utf8", function (err, data) {
        swaggerParse(data).then(function (dat) {
            res.send(dat);
        });
    });
}
module.exports = {
    type: type,
    fileUpload: fileUpload
}
