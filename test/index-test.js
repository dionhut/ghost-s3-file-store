/**
 * Created by dionh on 2/24/17.
 */
var S3Store = require('../');
var mock = require('nodeunit-mock');
var aws = require('aws-sdk');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var BaseStore = require('../base');
var util = require('util');
_ = require('lodash'),

exports.testS3StoreFileFolderWOutEndSlash = function (test) {
    test.expect(3);
    var s3 = new aws.S3();
    mock(test, s3, "putObject", function (request, callback) {
        test.equal("blog.dionhut.net", request.Bucket);
        test.equal(path.join("test", moment().format("YYYY/MM/DD"), "test1.jpg"), request.Key);
        callback(null, {});
    });

    fs.writeFileSync('test-data/test1.jpg', "1111");

    var s3FileStorage = new S3Store({bucket: "blog.dionhut.net", folder: "test"}, s3);
    s3FileStorage.save({path: 'test-data/test1.jpg'}).then(function (url) {
        test.equal("http://blog.dionhut.net.s3.amazonaws.com/" + path.join("test", moment().format("YYYY/MM/DD"), "test1.jpg"), url);
        test.done();
    });
};

exports.testNullOptions = function (test) {
    var s3FileStorage = new S3Store();
    s3FileStorage.save({path: 'test-data/IMG_0753.jpg'}).then(function (url) {
        test.ok(false);
        test.done();
    }, function (err) {
        test.ok(true);
        test.done();
    });
};

exports.testNullBucket = function (test) {
    var s3FileStorage = new S3Store({});
    s3FileStorage.save({path: 'test-data/IMG_0753.jpg'}).then(function (url) {
        test.ok(false);
        test.done();
    }, function (err) {
        test.ok(true);
        test.done();
    });
}

exports.testZeroLenBucket = function (test) {
    var s3FileStorage = new S3Store({bucket: ''});
    s3FileStorage.save({path: 'test-data/IMG_0753.jpg'}).then(function (url) {
        test.ok(false);
        test.done();
    }, function (err) {
        test.ok(true);
        test.done();
    });
};

exports.testInheritsBase = function (test) {
    var s3FileStorage = new S3Store({bucket: "blog.dionhut.net", folder: "test"});
    test.ok(s3FileStorage instanceof BaseStore);
    test.done();
};

exports.testRequiredFns = function (test) {
    var s3FileStorage = new S3Store({bucket: "blog.dionhut.net", folder: "test"});
    console.log('requiredFns - ', s3FileStorage.requiredFns);
    test.ok(s3FileStorage.requiredFns);
    test.equals(0, _.xor(s3FileStorage.requiredFns, Object.keys(_.pick(Object.getPrototypeOf(s3FileStorage), s3FileStorage.requiredFns))).length);
    test.done();
};

exports.testExists = function(test) {
    var s3FileStorage = new S3Store({bucket: "blog.dionhut.net", folder: "test"});
    s3FileStorage.exists('http://blog.dionhut.net.s3.amazonaws.com/test/IMG_0753.jpg').then(function(exists) {
        test.ok(exists);
        test.done();
    }, function(err) {
        console.log(err);
        test.ok(false);
        test.done();
    });
};

exports.testNotExists = function(test) {
    var s3FileStorage = new S3Store({bucket: "blog.dionhut.net", folder: "test"});
    s3FileStorage.exists('http://blog.dionhut.net.s3.amazonaws.com/test/IMG_0753__.jpg').then(function(exists) {
        test.ok(!exists);
        test.done();
    }, function(err) {
        console.log(err);
        test.ok(false);
        test.done();
    });
};
