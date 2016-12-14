var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var child = require('child_process');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, { path : '/api/socket/', origins : '*:*'});
var cameraControl = require('./camera-control');
var liveCamSignaling = require('./livecam-signaling');
var logSignaling = require('./log-signaling');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname));


//plug websocket events
io.on('connection', function (socket) {
	console.log('user connected');
	liveCamSignaling.plugEvents(socket);
	logSignaling.plugEvents(socket);
});

//API part : camera control. 
app.get('/api/cameraStatus', function (req, res)  {
	cameraControl.getStatus(res);

});

app.get('/api/cameraMode', function (req, res)  {
	res.json( {fakeCamera: cameraControl.getCameraMode() });
});

app.post('/api/cameraMode', function (req, res) {
	var fakeCamera = req.body.fakeCamera;
	cameraControl.setFakeCamera(fakeCamera);
	res.end();
});

server.listen(3000, function () {
	console.log('tamerbooth api listening on port 3000!');
});

module.exports = app;
