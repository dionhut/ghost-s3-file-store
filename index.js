/**
 * Created by dionh on 2/24/17.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var aws = require('aws-sdk');
var moment = require('moment');
var options = {};
var _s3Client = null;

function S3Store(config, s3Client) {
    options = config || {};

    // Injected s3Client for testability
    _s3Client = s3Client;
}

S3Store.prototype.save = function(image) {
    return new Promise(function(resolve, reject) {
        if(!options || !options.bucketName || options.bucketName.length == 0)
        {
            reject('Invalid s3-file-store config');
        }

        // New up s3 Client if not already injected
        var s3 = _s3Client ? _s3Client : new aws.S3();

        var stream = fs.createReadStream(image.path, { autoClose: true});

        var targetFolder = path.join(options.folder, moment().format('YYYY/MM/DD/'));
        var formattedFilename = path.parse(image.path);
        var targetFilename = formattedFilename.name + formattedFilename.ext;
        var targetKey = path.join(targetFolder, targetFilename);

        console.log("s3-file-store putObject", image.path, options.bucketName, targetKey);

        s3.putObject({ Bucket: options.bucketName, Key: targetKey, Body: stream }, function(error, data) {
            if(error) {
                reject(error);
            } else {
                resolve('http://' + options.bucketName + '.s3.amazonaws.com/' + targetKey);
            }
        });
    });
};

S3Store.prototype.serve = function serve(options) {
    return function(req, res, next) {
        next();
    }
};

module.exports = S3Store;