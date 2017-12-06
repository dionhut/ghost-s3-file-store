# Ghost S3 File Storage Plug-in

Compatible with Ghost ^1.18.2

[![Build Status](https://travis-ci.org/dionhut/ghost-s3-file-store.svg?branch=master)](https://travis-ci.org/dionhut/ghost-s3-file-store)

Once installed allows a ghost user to upload files directly to AWS S3 from
the Ghost editor without any changes to ghost source.
This is especially useful when deploying Ghost in AWS directly
on EC2 instances or Docker Containers where storing 
files to local disk isn't desirable.

This S3 storage adapter doesn't perform reading or serving the files and requires the specified S3 bucket configured with public read-only policy.  S3 is fit for this purpose of serving SPAs and/or assets via public url endpoint.

### Installation Example 

I like to deploy Ghost in a Docker container using the official [Ghost](https://hub.docker.com/_/ghost/)
image.

I created an npm project with a Dockerfile and installed ghost-s3-file-storage as a dependency.  This way when the container is built we can include the index.js and it's node_modules.

```
npm init

npm install --save ghost-s3-file-storage
```

Example Dockerfile

```
FROM ghost:1.18.2

ADD node_modules/ghost-s3-file-storage/node_modules /var/lib/ghost/content/adapters/storage/ghost-s3-file-storage/node_modules
ADD node_modules/ghost-s3-file-storage/index.js /var/lib/ghost/content/adapters/storage/ghost-s3-file-storage/index.js
```

Now we can build our Docker image.

```
docker build --rm -t ghost-blog:latest .
```

Now we can test it out and run our Ghost container with our new s3 storage adapter configured.

```
docker run --rm -p 2368:2368 -e NODE_ENV=development -e database__client=sqlite3
    -e database__connection__filename=/var/lib/ghost/content/data/ghost-test.db -e storage__active=ghost-s3-file-storage
    -e storage__ghost-s3-file-storage__region=us-west-2 -e storage__ghost-s3-file-storage__bucket=ghost-blog
    -e storage__ghost-s3-file-storage__folder=files -e AWS_ACCESS_KEY_ID=<access-key>
    -e AWS_SECRET_ACCESS_KEY=<secret> ghost-blog:latest
```

Note: Never store AWS credentials in source or configuration files or transmit them from your development machine in any way.  Best practice is to never set the AWS credentials in code via the aws-sdk client.  Instead utilize the default behavior of AWS sdk clients, credential provider chain which searches for credentials using chain of responsibility pattern searching for environment variables or IAM role (running within AWS data center) and so on.  See http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CredentialProviderChain.html

Bob's your uncle!  You should be able to create a new post from Ghost post editor
and upload a new image straight to an S3 bucket/folder.

#### Configuration

```
storage: {
    active: 'ghost-s3-file-storage',
    'ghost-s3-file-storage': {
        region: 'us-west-2',
        bucket: '<bucket>',
        folder: '<root-folder>',
        distributionUrl: 'https://abc.cloudfront.net'
    }
}
```

##### active
Refers to the /var/lib/ghost/content/adapters/storage directory where Ghost can find
this file storage plug-in.

##### region
(Optional) The AWS availability zone the S3 bucket was created in

##### bucket
The S3 bucket name

##### folder
The root folder to upload files into in the specified bucket

##### distributionUrl
(Optional) The base url to construct when returning url to Ghost if standing up a CloudFront
CDN in front of the S3 bucket.
Eg. `<distribution-url>`/`<folder>`/`<YYYY>`/`<MM>`/`<DD>`/`<guid>`.`<ext>`
See [here](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/MigrateS3ToCloudFront.html#adding-cloudfront-to-s3)
for details on how to set up CloudFront to cache files out on the edges.

If distributionUrl is not specified then defaults to S3 http url in which case region must be specified.
Eg. https://s3-`<region>`.amazonaws.com/`<bucket>`/`<folder>`/`<YYYY>`/`<MM>`/`<DD>`/`<guid>`.`<ext>`
If both region and distributionUrl are specified distributionUrl takes precedence.

### Feedback
Feedback and contributions welcome

