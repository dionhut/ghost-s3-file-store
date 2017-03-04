# Ghost S3 File Storage Plug-in

Ghost v0.11.5+

[![Build Status](https://travis-ci.org/dionhut/ghost-s3-file-store.svg?branch=master)](https://travis-ci.org/dionhut/ghost-s3-file-store)

Once installed allows a ghost user to upload files directly to AWS S3 from
the Ghost editor without any changes to ghost source.
This is especially useful when deploying Ghost in AWS directly
on EC2 instances or Docker Containers where storing 
files to local disk isn't desirable when multiple instances of
Ghost are deployed behind a load balancer.

### Installation 

#### Install via Docker Volume Container

I like to deploy Ghost in a Docker container using the official [Ghost](https://hub.docker.com/_/ghost/)
image.  As an added benefit deploying my config.json and
storage plug-in is really convenient to deploy as a separate linked container
using `--volumes-from`

First we need to create our data volume container.  But before we do that let's clone the
ghost-s3-file-store repo.

Create a new directory for your ghost blog data volume container.

```
mkdir ghost-blog-data
cd ghost-blog-data

npm init
npm install --save ghost-s3-file-storage
```

Next we can create a Dockerfile that looks a lot like below.

```
FROM node:4-slim

ENV GHOST_CONTENT /var/lib/ghost
WORKDIR "$GHOST_CONTENT"

COPY config.js config.js

WORKDIR "$GHOST_CONTENT/storage/ghost-s3-file-storage"
ADD node_modules node_modules
RUN cp node_modules/ghost-s3-file-store/index.js index.js

VOLUME $GHOST_CONTENT
```

And make sure you add your config.json file to this directory as well. Now we can build our
Docker image and create a container.

```
docker build -t ghost-blog-data .

docker create --name some-ghost-data ghost-blog-data
```

Now we can test it out and run our Ghost container linked to our newly created
data volume container.

```
docker pull ghost

docker run --name some-ghost -p 8080:2368
  -e AWS_ACCESS_KEY_ID=<key>
  -e AWS_SECRET_ACCESS_KEY=<secret>
  --volumes-from some-ghost-data ghost
```

Bob's your uncle!  You should be able to create a new post from Ghost post editor
and upload a new image straight to an S3 bucket/folder.

#### Install directly to $GHOST_SOURCE

Why would you do this when you can use Docker?

Ok.

TODO:  Try this method out.  Or maybe someone would do me a
favour and try it out.  Would love the feedback.

#### Configuration

Add this json to your Ghost config.json file.

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
Refers to the $GHOST_CONTENT/storage/ghost-s3-file-storage directory where Ghost can find
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

###Feedback
Feedback and contributions welcome

