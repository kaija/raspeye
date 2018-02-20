var express = require('express');
var AWS = require('aws-sdk');
var config = require('config');
var util = require('util');
const uuidv4 = require('uuid/v4');


function pad(num, size) {
  var s = String(num);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

var videoS3Bucket = config.get('aws.video_bucket');
var rekognition = new AWS.Rekognition({endpoint: config.get('aws.region')});
var s3 = new AWS.S3();

var router = express.Router();

function videoS3Path(device) {
  var now = new Date();
  var datestr = util.format("%d%s%s%s%s%s",now.getUTCFullYear() , pad(now.getUTCMonth()+1,2), pad(now.getUTCDate(), 2), pad(now.getUTCHours(), 2), pad(now.getUTCMinutes(),2), pad(now.getUTCSeconds(),2));
  var path = device + '/' + datestr + '.mp4';
  return path;
}

function videoFaceDetect(key, uuid) {
  var params = {
    Video: {
      S3Object: {
        Bucket: videoS3Bucket,
        Name: key
      }
    },
    ClientRequestToken: uuid,
    FaceAttributes: ALL,
    JobTag: 'demo' /*,
    NotificationChannel: {
      RoleArn: 'STRING_VALUE',
      SNSTopicArn: 'STRING_VALUE'
    }
    */
  };
  return new Promise(function(fulfill, reject){
    rekognition.startFaceDetection(params, function(err, data) {
      if(err) {
        reject(err);
      }else{
        fulfill(data);
      }
    });
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* POST mp4 video file */
router.post('/detect', function(req, res, next) {
  if (req.files.video && req.body.device) {
    s3Key = videoS3Path(req.body.device);
    jobId = uuidv4();
    params = {Bucket: videoS3Bucket, Key: s3Key, Body: req.files.video.data};
    s3.putObject(params, function(err, data){
      if (err) {
        console.log(err);
      } else {
        console.log('upload successfully. (job: ' + jobId + ')' + JSON.stringify(params) );
        videoFaceDetect(s3Key, jobId).then((data)=>{
          console.log(data);
        }).catch((err)=>{
          console.log(err);
        });
      }
    });
    res.send({message: 'file uploaded ' + videoS3Bucket + '/' + videoS3Path(req.body.device)});
  } else {
    res.status(400).send({error: 'missing video file!'});
  }
});

module.exports = router;
