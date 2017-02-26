var S3Store = require('../');
var aws = require('aws-sdk');
var moment = require('moment');
var path = require('path');
var fs = require('fs');

// requires running on development environment aws configure via aws-cli to setup accessKey and secret

module.exports = {
    setUp: function (callback) {
        var writeStream = fs.createWriteStream('test-data/test.jpg', { autoClose: true });
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
        var s3FileStorage = new S3Store({bucket: "blog.dionhut.net", folder: "test/"});
        s3FileStorage.save({path: 'test-data/test.jpg'}).then(function (url) {
            test.equal("http://blog.dionhut.net.s3.amazonaws.com/" + path.join("test", moment().format("YYYY/MM/DD"), "test.jpg"), url);
            test.done();
        }, function (err) {
            console.log(err);
            test.ifError(err);
            test.done();
        });
    }
};