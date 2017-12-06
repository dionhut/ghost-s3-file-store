var S3Store = require('../');
var aws = require('aws-sdk');
var moment = require('moment');
var path = require('path');
var fs = require('fs');

// Requires running on development environment
// Use command: aws configure
// via aws-cli to setup accessKey and secret
// Never set credentials in code see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CredentialProviderChain.html

module.exports = {
    setUp: function (callback) {
        var writeStream = fs.createWriteStream('test.jpg', { autoClose: true });
        var s3 = new aws.S3();
        var readStream = s3.getObject({ Bucket: "blog.dionhut.net", Key: "test/IMG_0753.jpg" }).createReadStream();
        readStream.pipe(writeStream);
        readStream.on('finish', function() {
            console.log("Finished downloading test image file");
            callback();
        });
    },

    tearDown: function (callback) {
        var s3 = new aws.S3();
        s3.deleteObject({ Bucket: "blog.dionhut.net", Key: path.join("test", moment().format("YYYY/MM/DD"), "test.jpg") }, function(err, data) {
            if(err) {
                console.log("Failed to delete test image");
            } else {
                console.log("Deleted test image file - " + path.join("test", moment().format("YYYY/MM/DD"), "test.jpg"));
            }
            callback();
        });
    },

    testS3StoreFile: function (test) {
        var s3FileStorage = new S3Store({region: "us-west-2", bucket: "blog.dionhut.net", folder: "test/"});
        s3FileStorage.save({ fieldname: 'uploadimage',
        originalname: "IMG_0023.JPG",
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/tmp',
        filename: 'test.jpg',
        path: 'test.jpg',
        size: 2672476,
        name: 'IMG_0023.JPG',
        type: 'image/jpeg',
        ip: '172.17.0.1',
        context: { user: '1', client: null, client_id: null }
    }).then(function (url) {
            test.equal("https://s3-us-west-2.amazonaws.com/blog.dionhut.net/" + path.join("test", moment().format("YYYY/MM/DD"), "test.JPG"), url);
            test.done();
        }, function (err) {
            console.log(err);
            test.ifError(err);
            test.done();
        });
    }
};