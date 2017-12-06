/**
 * Created by dionh on 2/24/17.
 */
'use strict';

var BaseAdapter = require('ghost-storage-base');
var fs = require('fs');
var path = require('path');
var util = require('util');
var aws = require('aws-sdk');
var moment = require('moment');
var https = require('https');
var Promise = require('bluebird');
var _ = require('lodash');

class S3Adapter extends BaseAdapter {

    constructor(config, s3Client) {
        super();

        this._config = config || {};
        
        // Injected s3Client for testability
        this._s3Client = s3Client || new aws.S3();
    
        console.log('S3Store initialized - ', JSON.stringify(this._config));
    }
    
    exists(filename) {
        return new Promise(function (resolve, reject) {
            https.get(filename, function(res) {
                resolve(res.statusCode == 200);
            });
        });
    }
  
    save(image, targetDir) {
        return new Promise(function(resolve, reject) {
            if(!this._config || _.isEmpty(this._config.bucket))
            {
                reject('Invalid s3-file-store config - Bucket is required');
                return;
            }
            if(_.isEmpty(this._config.region) && _.isEmpty(this._config.distributionUrl))
            {
                reject('Invalid s3-file-store config - Must specify either region or distributionUrl');
                return;
            }
    
            var stream = fs.createReadStream(image.path, { autoClose: true });
    
            var targetFolder = path.join(this._config.folder, moment().format('YYYY/MM/DD/'));
            // Preserve origin file extension
            var formattedOriginalFilename = path.parse(image.originalname);
            var formattedFilename = path.parse(image.filename);
            var targetFilename = formattedFilename.name + formattedOriginalFilename.ext;
            var targetKey = path.join(targetFolder, targetFilename);
    
            console.log("s3-file-store putObject", image, this._config.bucket, targetKey);
    
            this._s3Client.putObject({ Bucket: this._config.bucket, Key: targetKey, Body: stream }, function(error, data) {
                if(error) {
                    reject(error);
                } else {
                    if(_.isEmpty(this._config.distributionUrl)) {
                        resolve(util.format('https://s3-%s.amazonaws.com/%s/%s', this._config.region, this._config.bucket, targetKey));
                    } else {
                        resolve(util.format('%s/%s', this._config.distributionUrl, targetKey));
                    }
                }
            }.bind(this));
        }.bind(this));
    }
  
    serve() {
        // Not required with S3 bucket and public read policy to serve file requests
        return function customServe(req, res, next) {
            next();
        }
    }
  
    delete() {
        return new Promise(function(resolve) {
            reject('Not supported');
        });
    }
  
    read() {
        // Not required with S3 bucket and public read policy to serve file requests
        return new Promise(function(resolve) {
            reject('Not supported');
        });
    }
}

module.exports = S3Adapter;