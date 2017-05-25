var AWS = require("aws-sdk");
AWS.config.loadFromPath('./config.json');
var sqs = new AWS.SQS();
var s3 = new AWS.S3();
var lwip = require('lwip');
var bucketName = "dzemba-lab";

function doResize(msg) {

	var msgBody = JSON.parse(JSON.stringify(msg))[0]["Body"];
	var file = JSON.parse(msgBody).file;
	var resizeValueX = JSON.parse(msgBody).resizeValueX;
	var resizeValueY = JSON.parse(msgBody).resizeValueY;

	var params = {
		Bucket : bucketName,
		Key : file
	};

	s3.getObject(params, function (err, data) {
		if (err) {
			console.log("Error: " + err);
		} else {
			lwip.open(data.Body, 'jpg', function (err, image) {
				if (err) {
					console.log("Error: " + err);
				} else {
					image.resize(resizeValueX, resizeValueY, function (err, image) {
						if (err) {
							console.log("Error: " + err);
						} else {
							image.toBuffer('jpg', function (err, buffer) {
								if (err) {
									console.log("Error: " + err);
								} else {
									var nextParams = {
										Bucket : params.Bucket,
										Key : params.Key,
										Body : buffer,
										ACL : 'public-read'
									};

									s3.upload(nextParams, function (err, data) {
										if (err) {
											console.log("Error: " + err);
										} else {
											var time = require('time');
											var now = new time.Date();
											now.setTimezone('Europe/Warsaw');
											console.log("Plik " + file + " zostal przeskalowany " + now.toString() + " \nNowe wymiary X: " + resizeValueX + " Y: " + resizeValueY);
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
}
exports.doResize = doResize;
