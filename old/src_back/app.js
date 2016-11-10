var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var child = require('child_process');
var app = express();
var cameraControl = require('./camera-control');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname));


app.get('*/stream.mjpg', function (req, res) {
	var gpCmd = child.spawn('gphoto2 --capture-movie --stdout');
	gpCmd.stdout.pipe(res);
	gpCmd.stderr.pipe(res);

});


app.get('*/streamtest.ogg', function (req, res) {
	//var gpCmd = child.spawn('pwd');
	//cameraControl.setFakeCamera(false);
	cameraControl.getLiveView(res);
});

app.get('*/test', function (req, res) {
	//res.send('api is working ! ');
	res.send(cameraControl.foo);
});

app.get('*/test2', function (req, res) {
	//res.send('api is working ! ');
	cameraControl.foo = 'pliplpop';
	res.send(cameraControl.foo);
});

// app.get('/*', function (req, res) {
	// res.sendFile(path.join(__dirname,'index.html'));
// });

app.listen(3000, function () {
	console.log('tamerbooth api listening on port 3000!');
});

module.exports = app;
