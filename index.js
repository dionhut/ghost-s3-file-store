/**
 * Created by dionh on 2/24/17.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var aws = require('aws-sdk');
var moment = require('moment');
var https = require('https');
var Promise = require('bluebird');
if(!process.env.GHOST_SOURCE) {
    var BaseStore = require('./base');
} else {
    var BaseStore = require(path.join(process.env.GHOST_SOURCE, 'core/server/storage/base'));
}

var options = {};
var _s3Client = null;

function S3Store(config, s3Client) {
    BaseStore.call(this);

    options = config || {};

    // Injected s3Client for testability
    _s3Client = s3Client ? s3Client : new aws.S3();

    console.log('S3Store initialized - ', JSON.stringify(options));
}

util.inherits(S3Store, BaseStore);

S3Store.prototype.save = function(image) {
    return new Promise(function(resolve, reject) {
        if(!options || _.isEmpty(options.bucket))
        {
            reject('Invalid s3-file-store config - Bucket is required');
            return;
        }
        if(_.isEmpty(options.region) && _.isEmpty(options.distributionUrl))
        {
            reject('Invalid s3-file-store config - Must specify either region or distributionUrl');
            return;
        }

        var stream = fs.createReadStream(image.path, { autoClose: true });

        var targetFolder = path.join(options.folder, moment().format('YYYY/MM/DD/'));
        var formattedFilename = path.parse(image.path);
        var targetFilename = formattedFilename.name + formattedFilename.ext;
        var targetKey = path.join(targetFolder, targetFilename);

        console.log("s3-file-store putObject", image.path, options.bucket, targetKey);

        _s3Client.putObject({ Bucket: options.bucket, Key: targetKey, Body: stream }, function(error, data) {
            if(error) {
                reject(error);
            } else {
                if(_.isEmpty(options.distributionUrl)) {
                    resolve(util.format('https://s3-%s.amazonaws.com/%s/%s', options.region, options.bucket, targetKey));
                } else {
                    resolve(util.format('%s/%s', options.distributionUrl, targetKey));
                }
            }
        });
    });
};

S3Store.prototype.serve = function serve(options) {
    return function(req, res, next) {
        next();
    }
};

S3Store.prototype.exists = function exists(filename) {
    return new Promise(function (resolve, reject) {
        https.get(filename, function(res) {
            resolve(res.statusCode == 200);
        });
    });
};

S3Store.prototype.delete = function deleteFile(fileName, targetDir) {
    return new Promise(function(resolve) {
        reject('Not supported');
    });
};

S3Store.prototype.read = function read(options) {
    return new Promise(function(resolve) {
        reject('Not supported');
    });
};

module.exports = S3Store;