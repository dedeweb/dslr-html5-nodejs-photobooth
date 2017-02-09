var child = require('child_process');
var process = require('process');
var fs = require('fs-extra');
var sharp = require('sharp');
var instance = null;

//Go to script directory
process.chdir(__dirname);


function CameraControl(logger, db){
	if(instance !== null){
		throw new Error("Cannot instantiate more than one CameraControl, use CameraControl.getInstance()");
	}

	this.initialize(logger, db);
}
CameraControl.prototype = {
	initialize: function(logger, db){
		this.fakeCamera = false;
		this.logger = logger;
		this.db = db;
	},

	getRawDirectory : function () {
		var that = this;
		return new Promise(function (resolve, reject) {
			that.db.find({ key: 'rawDir'}, function (err, docs) {
				if(docs && docs.length) {
					that.logger.log('get raw dir infos ' + JSON.stringify(docs[0].dir) );
					resolve(docs[0].dir);
				} else {
					that.logger.warn('raw dir found, creating default one ! ');
					var data = {
						key: 'rawDir',
						dir : 'raw'};
					that.db.insert(data);
					resolve(data.dir);
				}
			});
		});
	},
	
	setRawDirectory: function (dir) {
		var that = this;
		return new Promise(function (resolve, reject) {
			that.logger.log('set raw dir : ' + dir );
			//testing existence and rights
			fs.access(dir, fs.R_OK | fs.W_OK | fs.X_OK, function (err) {
				if(err) {
					that.logger.error('cannot read/write directory ' + dir);
					reject('cannot read/write directory');
				} else {
					that.db.update( {key: 'rawDir'}, {key: 'rawDir', dir: dir}, function (err, numReplaced) {
						if(err) {
							that.logger.error('error saving db : ' + err);
							reject(err);
						} else {
							that.logger.log('dir saved. num replaced = ' + numReplaced);
							resolve();
						}
					});
				}
				
			});
			
		});
	},
	
	setFakeCamera : function (flag) {
		this.fakeCamera = flag;
	},
	getCameraMode: function () {
		return this.fakeCamera;
	},

	getStatus: function (res) {
		var that = this;
		
		return new Promise(function (resolve, reject) {
			var summaryCmd;
		
			if(that.fakeCamera) {
				//summaryCmd = child.spawnSync('server/fake_gphoto.sh', ['--summary']);
				summaryCmd = child.spawnSync('sh', ['fake_gphoto.sh', '--summary']);
			} else {
				summaryCmd = child.spawnSync('gphoto2', ['--summary']);
			}

			if('' + summaryCmd.stderr ) {
				that.logger.error('get summary command response : ' + summaryCmd.stderr);
				//res.json( {error: true, message: ''+summaryCmd.stderr});
				reject(summaryCmd.stderr);
				//res.json( {error: true, message: '' + summaryCmd.stderr});

			}
			else
			{
				that.logger.log('get summary command response : ' + summaryCmd.stdout);
				resolve(summaryCmd.stdout);
				//res.json( {error: false, message : '' + summaryCmd.stdout});
			}
			
		});
		
	},

	capturePreview: function() {
		var logger = this.logger, that = this;
		return new Promise(function (resolve, reject) {
			var previewCommand;
			if(that.fakeCamera) {
				previewCommand = child.spawnSync('sh', ['fake_gphoto.sh', '--capture-preview']);
			} else {
				previewCommand = child.spawnSync('gphoto2', ['--capture-preview', '--force-overwrite']);
			}

			if('' + previewCommand.stderr ) {
				logger.error('capture preview command response : ' + previewCommand.stderr)
				reject(previewCommand.stderr);
				//res.status(500).send( '' + previewCommand.stderr);
			}
			else
			{
				logger.log('capture preview command response : ' + previewCommand.stdout);
				 // read binary data
				var img = fs.readFileSync('capture_preview.jpg');
				// convert binary data to base64 encoded string
				var imgBase64 = new Buffer(img).toString('base64');
				resolve( 'data:image/jpeg;base64,' + imgBase64);
				//res.status(200).send(imgBase64);
			}
		});
	},

	captureImage: function(res) {
		var logger = this.logger, that = this;
		return new Promise(function (resolve, reject) {
			var captureCommand;
			var shouldFailPromise = false;
			var errorMessage = '';
			if(that.fakeCamera) {
				captureCommand = child.spawn('sh', ['fake_gphoto.sh', '--capture-image-and-download']);
			} else {
				captureCommand = child.spawn('gphoto2', ['--capture-image-and-download', '--force-overwrite']);
			}

			captureCommand.stdout.setEncoding('utf8');
			captureCommand.stderr.setEncoding('utf8');

			captureCommand.stderr.on('data', function (data) {
				shouldFailPromise = true;
				logger.error( 'error : ' + data);
				errorMessage += data;
			});

			var jpegRegex = /Deleting file \/(.*)?\.jpg on the camera/g;
			var rawRegex = /Deleting file \/(.*)?\.cr2 on the camera/g;

			that.getRawDirectory().then(function(dir) {
				captureCommand.stdout.on('data', function (data) {
					logger.log('[capture command]' + data);
					var matchJpeg = jpegRegex.exec('' + data);
					if(matchJpeg && matchJpeg.length > 1 ) {
						var jpegFile = matchJpeg[1] + '.jpg';
						shouldFailPromise = false;
						logger.log('['+new Date().toString()+'] resizing jpeg ' + jpegFile);
						fs.readFile(jpegFile, function (err, data) {

							if(err) {
								logger.error('error reading file !' + err);
							}	
							else
							{
								sharp(data).resize(1600,1200).max().toBuffer()
								.then(function (data) {
									logger.log('['+new Date().toString()+'] sending jpeg ' + jpegFile );

									resolve({ src: 'data:image/jpeg;base64,' + data.toString('base64')});
									//res.status(200).send(data.toString('base64'));
								}).catch(function(err) {
									logger.error(err);
									reject(err);
									//res.status(500).send(err);
								});
							}
						});
					}
					
					var matchRaw = rawRegex.exec('' + data);
					if(matchRaw && matchRaw.length > 1 ) {
						var rawFile = matchRaw[1] + '.raw';
					}
					
					
				});	
			});
			

			captureCommand.on('close', function() {
				if(shouldFailPromise) {
					reject(errorMessage);
				}
			});
		});
		/*
		captureCommand.on('exit', function (data) {
			res.status(200).send('' + captureCommand.stdout);
		});*/

	}
};
CameraControl.getInstance = function(logger, db){
	// summary:
	//      Gets an instance of the singleton. It is better to use
	if(instance === null){
		instance = new CameraControl(logger, db);
	}
	return instance;
};

exports = module.exports = CameraControl.getInstance;

