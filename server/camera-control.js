var child = require('child_process');
var process = require('process');
var fs = require('fs');
var sharp = require('sharp');
var instance = null;

//Go to script directory 
process.chdir(__dirname);


function CameraControl(logger){
	if(instance !== null){
		throw new Error("Cannot instantiate more than one CameraControl, use CameraControl.getInstance()");
	} 
	
	this.initialize(logger);
}
CameraControl.prototype = {
	initialize: function(logger){
		this.fakeCamera = false;
		this.logger = logger;
	},
	getLiveView: function (res) {
		if(this.fakeCamera) {
			this.liveStreamCmd = child.spawn('sh', ['src_back/fakestream.sh']);
		} else {
			this.liveStreamCmd = child.spawn('sh', ['src_back/stream.sh']);
		}
		this.liveStreamCmd.stdout.pipe(res);
		this.liveStreamCmd.stderr.pipe(res);	
	},
	setFakeCamera : function (flag) {
		this.fakeCamera = flag;
	},
	getCameraMode: function () {
		return this.fakeCamera;
	},
	getPicture: function (res) {
		child.spawn('gphoto2', ['--capture-image-and-download', '--filename photo-%Y%m%d-%H%M%S.jpg']);
	},
	
	getStatus: function (res) {
		
		var summaryCmd;
		if(this.fakeCamera) {
			//summaryCmd = child.spawnSync('server/fake_gphoto.sh', ['--summary']);	
			summaryCmd = child.spawnSync('sh', ['fake_gphoto.sh', '--summary']);	
		} else {
			summaryCmd = child.spawnSync('gphoto2', ['--summary']);	
		}
		
		if('' + summaryCmd.stderr ) {
			console.log('response : ' + summaryCmd.stderr)
			//res.json( {error: true, message: ''+summaryCmd.stderr});
			res.json( {error: true, message: '' + summaryCmd.stderr});
			
		} 
		else 
		{
			res.json( {error: false, message : '' + summaryCmd.stdout});
		}
	},
	
	capturePreview: function(res) {
		var previewCommand;
		if(this.fakeCamera) {
			previewCommand = child.spawnSync('sh', ['fake_gphoto.sh', '--capture-preview']);
		} else {
			previewCommand = child.spawnSync('gphoto2', ['--capture-preview', '--force-overwrite']);	
		}
		
		if('' + previewCommand.stderr ) {
			console.log('response : ' + previewCommand.stderr)
			res.status(500).send( '' + previewCommand.stderr);
		} 
		else 
		{
			console.log('response : ' + previewCommand.stdout);
			 // read binary data
			var img = fs.readFileSync('capture_preview.jpg');
			// convert binary data to base64 encoded string
			var imgBase64 = new Buffer(img).toString('base64');
			
			res.status(200).send(imgBase64);
		}
		
	},
	
	captureImage: function(res) {
		var captureCommand;
		if(this.fakeCamera) {
			captureCommand = child.spawn('sh', ['fake_gphoto.sh', '--capture-image-and-download']);
		} else {
			captureCommand = child.spawn('gphoto2', ['--capture-image-and-download', '--force-overwrite']);	
		}
		
		captureCommand.stdout.setEncoding('utf8');
		var jpegRegex = /Saving file as (.*)?\.jpg/g;
		var rawRegex = /Saving file as (.*)?\.cr2/g;
		
		captureCommand.stdout.on('data', function (data) {
			console.log('' + data);
			var match = jpegRegex.exec('' + data);
			if(match && match.length > 1 ) {
				var jpegFile = match[1] + '.jpg';
				console.log('['+new Date().toString()+']resizing jpeg ' + jpegFile);
				sharp(jpegFile).resize(1600,1200).toBuffer()
				.then(function (data) {
					console.log('['+new Date().toString()+']sending jpeg ' + jpegFile );
					res.status(200).send(data.toString('base64'));
				}).catch(function(err) {
					console.log(err);
					res.status(500).send(err);
				});
				/*
				jimp.read(jpegFile, function (err, file) {
					console.log('['+new Date().toString()+']file loaded ' + jpegFile);
					
					file.resize(1600,1200).quality(60).getBuffer(jimp.MIME_JPEG, function (err, buffer) {
						console.log('['+new Date().toString()+']sending jpeg ' + jpegFile );
						res.status(200).send(buffer.toString('base64'));
					});
				});
				*/
				 // read binary data
				//var img = fs.readFileSync(jpegFile);
				// convert binary data to base64 encoded string
				//var imgBase64 = new Buffer(img).toString('base64');
				//res.status(200).send(imgBase64);
			}
		});
		/*
		captureCommand.on('exit', function (data) {
			res.status(200).send('' + captureCommand.stdout);
		});*/
		
	}
};
CameraControl.getInstance = function(logger){
	// summary:
	//      Gets an instance of the singleton. It is better to use 
	if(instance === null){
		instance = new CameraControl(logger);
	}
	return instance;
};

exports = module.exports = CameraControl.getInstance;

