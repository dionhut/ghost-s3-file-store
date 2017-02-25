/**
 * Created by dionh on 2/24/17.
 */
var S3Store = require('../');
var mock = require('nodeunit-mock');
var aws = require('aws-sdk');

exports.testS3StoreFile = function(test) {
    // requires running on development environment aws configure via aws-cli

    var s3FileStorage = new S3Store({ bucketName: "blog.dionhut.net", folder: "test/"});
    s3FileStorage.save({ path: 'test-data/IMG_0753.jpg'}).then(function(url) {
        test.equal('http://blog.dionhut.net.s3.amazonaws.com/test/2017/02/24/IMG_0753.jpg', url);
        test.done();
    }, function(err) {
        console.log(err);
        test.ifError(err);
        test.done();
    });
};

exports.testS3StoreFileFolderWOutEndSlash = function(test) {
    test.expect(3);
    var s3 = new aws.S3();
    mock(test, s3, "putObject", function(request, callback) {
        test.equal("blog.dionhut.net", request.Bucket);
        test.equal("test/2017/02/24/IMG_0753.jpg", request.Key);
        callback(null, {});
    });
    var s3FileStorage = new S3Store({ bucketName: "blog.dionhut.net", folder: "test"}, s3);
    s3FileStorage.save({ path: 'test-data/IMG_0753.jpg'}).then(function(url) {
        test.equal('http://blog.dionhut.net.s3.amazonaws.com/test/2017/02/24/IMG_0753.jpg', url);
        test.done();
    });
};

exports.testNullOptions = function(test) {
    var s3FileStorage = new S3Store();
    s3FileStorage.save({ path: 'test-data/IMG_0753.jpg'}).then(function(url) {
        test.fail();
        test.done();
    }, function(err) {
        test.ok(true);
        test.done();
    });
};

exports.testNullBucket = function(test) {
    var s3FileStorage = new S3Store({});
    s3FileStorage.save({ path: 'test-data/IMG_0753.jpg'}).then(function(url) {
        test.fail();
        test.done();
    }, function(err) {
        test.ok(true);
        test.done();
    });
};

exports.testZeroLenBucket = function(test) {
    var s3FileStorage = new S3Store({ bucketName: '' });
    s3FileStorage.save({ path: 'test-data/IMG_0753.jpg'}).then(function(url) {
        test.fail();
        test.done();
    }, function(err) {
        test.ok(true);
        test.done();
    });
};