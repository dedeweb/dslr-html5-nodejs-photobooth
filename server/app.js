var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
//var child = require('child_process');
var app = express();
var httpServer = require('http').Server(app);
var https = require('https');
var pem = require('pem');
var io = require('socket.io')({ path : '/api/socket/', origins : '*:*'});
var logger = require('./log-client')(io);
var Datastore = require('nedb');
var db = new Datastore({filename: './tamerbooth.db'});
db.loadDatabase(function(err) {
	if(err) {
		logger.error('Error loading db : ' + JSON.stringify(err));
	} else  {
		logger.log('db loaded');
	}
});

var cameraControl = require('./camera-control')(logger, db);
var liveCamSignaling = require('./livecam-signaling')(logger);
var logSignaling = require('./log-signaling');


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname));



//Serve angular apps

app.get('/', function (req, res) {
	res.sendFile('admin/index.html', {root: __dirname});
});
app.get('/admin*', function (req, res) {
	res.sendFile('admin/index.html', {root: __dirname});
});
app.get('/camera*', function (req, res) {
	res.sendFile('camera/index.html', {root: __dirname});
});
app.get('/front*', function (req, res) {
	res.sendFile('front/index.html', {root: __dirname});
});

//plug websocket events
io.on('connection', function (socket) {
	logger.log('user connected');
	liveCamSignaling.plugEvents(socket);
	logSignaling.plugEvents(socket, io);
	socket.on('request-calibration-images', function () {
		socket.broadcast.emit('request-calibration-images');
		//TODO : sending image from camera
		cameraControl.capturePreview()
		.then(function (data) {
			io.emit('camera-image', data);
		});
	});
});

//API part : https to http proxy
app.post('/api/httpproxy', function (req, res) {

	var url = req.body.url;
	var verb = req.body.verb;
	var data = req.body.data;
	logger.log('proxy request. \n url: ' + url  + '\n verb: ' + verb + '\n data: ' + JSON.stringify(data));
	var req2;
	if(verb == 'POST') {
		req2 = request.post({uri: url, json: data});
	} else {
		req2 = request.get(url);
	}
  req2
	.on('error', function(err){res.status(500).send(err);})
	.pipe(res)
	.on('error', function(err){res.status(500).send(err);});
});

//API part : authorize.
app.get('/api/authorizeModule/:module', function (req, res)  {
	if(logSignaling.isAlreadyConnected(req.params.module)) {
		res.status(403).send('Module already launched. Please close the other window and refresh page.');
	} else {
		res.status(200).send('OK');
	}
});


//API part : webcam calibration-images
app.get('/api/webcamCrop', function (req, res) {
	logger.log('retrieve webcam crop');
	db.find({ key: 'crop'}, function (err, docs) {
		if(docs && docs.length) {
			logger.log('get webcam crop infos ' + JSON.stringify(docs[0].coords) );
			res.status(200).send(docs[0].coords);
		} else {
			logger.warn('coords not found, creating new ones ! ');
			var data = {
				key: 'crop',
				coords : null};
			db.insert(data);
			res.status(200).send(data.coords);
		}
	});
});

app.post('/api/webcamCrop', function (req, res) {
	var coords = req.body;
	logger.log('set crop coordinates : '+ JSON.stringify(coords) );
	db.update( {key: 'crop'}, {key: 'crop', coords: coords}, function (err, numReplaced) {
		if(err) {
			logger.error('error saving db : ' + err);
			res.status(500).send(err);
		} else {
			logger.log('coords saved. num replaced = ' + numReplaced);
			res.status(200).end();
		}
	});
});

//API part : camera control.
app.get('/api/cameraStatus', function (req, res)  {
	cameraControl.getStatus()
		.then(function (msg) {
			res.json( {error: false, message : '' + msg});
		}).catch(function (msg) {
			res.json( {error: true, message: '' + msg});
		});
});

app.get('/api/capturePreview', function (req, res)  {
	cameraControl.capturePreview()
		.then(function (data) {
			res.status(200).send(data);
		})
		.catch(function (data) {
			res.status(500).send( '' + data);
		});
});

app.get('/api/captureImage', function (req, res)  {
	cameraControl.captureImage()
		.then(function (data) {
			res.status(200).send(data);
		})
		.catch(function (data) {
			res.status(500).send( '' + data);
		});
});

app.get('/api/cameraMode', function (req, res)  {
	res.json( {fakeCamera: cameraControl.getCameraMode() });
});

app.post('/api/cameraMode', function (req, res) {
	var fakeCamera = req.body.fakeCamera;
	logger.log('set fake camera : ' + fakeCamera);
	cameraControl.setFakeCamera(fakeCamera);
	res.end();
});

httpServer.listen(3000, function () {
	logger.log('[http]tamerbooth api listening on port 3000!');
});
io.attach(httpServer);

pem.createCertificate({days:7, selfSigned:true}, function(err, keys){
    var httpsServer = https.createServer({key: keys.serviceKey, cert: keys.certificate}, app);
	httpsServer.listen(3043, function () {
		logger.log('[https]tamerbooth api listening on port 3043!');
	});
	io.attach(httpsServer);
});




module.exports = app;
