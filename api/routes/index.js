var express = require('express');
var router = express.Router();
var files = require ('./file_upload');


/* GET home page. */
router.post('/file_upload',files.type,files.fileUpload);


module.exports = router;
