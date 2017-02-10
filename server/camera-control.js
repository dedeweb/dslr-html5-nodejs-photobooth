var child = require('child_process');
var process = require('process');
var fs = require('fs-extra');
var sharp = require('sharp');
var path = require('path');
var moment = require('moment');
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
		var that = this;
		this.fakeCamera = false;
		this.logger = logger;
		this.db = db;
		this.outputDir = '';
		this.getOutputDirectory().then(function (dir) {
			that.outputDir = dir;
		});
	},

	getOutputDirectory : function () {
		var that = this;
		return new Promise(function (resolve, reject) {
			that.db.find({ key: 'outputDir'}, function (err, docs) {
				if(docs && docs.length) {
					that.logger.log('get output dir infos ' + JSON.stringify(docs[0].dir) );
					resolve(docs[0].dir);
				} else {
					that.logger.warn('output dir found, creating default one ! ');
					var data = {
						key: 'outputDir',
						dir : './output'};
					that.db.insert(data);
					resolve(data.dir);
				}
			});
		});
	},
	
	setOutputDirectory: function (dir) {
		var that = this;
		return new Promise(function (resolve, reject) {
			that.logger.log('set raw dir : ' + dir );
			//testing existence and rights
			fs.access(dir, fs.R_OK | fs.W_OK | fs.X_OK, function (err) {
				if(err) {
					that.logger.error('cannot read/write directory ' + dir);
					reject('cannot read/write directory');
				} else {
					that.db.update( {key: 'outputDir'}, {key: 'outputDir', dir: dir}, function (err, numReplaced) {
						if(err) {
							that.logger.error('error saving db : ' + err);
							reject(err);
						} else {
							that.logger.log('dir saved. num replaced = ' + numReplaced);
							that.oututDir = dir;
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

			var uniqueFileName = moment().format('YYYYMMDD_HHmmss');
			
			var jpegPromise = null, rawPromise = null;
			captureCommand.stdout.on('data', function (data) {
				logger.log('[capture command]' + data);
				var matchJpeg = jpegRegex.exec('' + data);
				if(matchJpeg && matchJpeg.length > 1 ) {
					var jpegFile = matchJpeg[1] + '.jpg';
					shouldFailPromise = false;
					jpegPromise = that._processJpeg(jpegFile, uniqueFileName);
				}
				
				var matchRaw = rawRegex.exec('' + data);
				if(matchRaw && matchRaw.length > 1 ) {
					var rawFile = matchRaw[1] + '.cr2';
					rawPromise = that._processRaw(rawFile, uniqueFileName);
				}				
			});	
			
			

			captureCommand.on('close', function() {
				if(shouldFailPromise || !jpegPromise || !rawPromise ) {
					reject(errorMessage);
				} else {
					//chaining jpeg and raw promises. 
					jpegPromise
						.then(function (data) {
							resolve(data);
							return rawPromise;
						})
						.then(function (data) {
							logger.log('raw processed');
						})
						.catch(function (err) {
							reject(err);
						});
				}
				
			});
		});
		/*
		captureCommand.on('exit', function (data) {
			res.status(200).send('' + captureCommand.stdout);
		});*/

	},
	
	getPrintPreview: function (imageId) {
		var file = path.join(this.outputDir, imageId + '.jpg'), that = this;
		return new Promise(function (resolve, reject) {
			sharp(file)
			.resize(1024,768).max().toBuffer()
			.then(function (imgResized) {
				sharp(imgResized).metadata().then(function (imgResizedMetadata) {
					sharp('./overlay.png').resize(imgResizedMetadata.width,imgResizedMetadata.height).max().toBuffer().then(function (overlay) {
						sharp(imgResized)
						.overlayWith(overlay)
						.toBuffer().then(function (imgOverlayed) {
							resolve('data:image/jpeg;base64,' + imgOverlayed.toString('base64'));							
						}).catch(function (err) {
							logger.error(err);
							reject(err);
						});
					}).catch(function (err) {
						logger.error(err);
						reject(err);
					});
				});
			});
		});
	},
	
	_processJpeg: function (jpegFile, uniqueFileName) {
		var logger = this.logger, that = this;
		return new Promise(function (resolve, reject) {
			logger.log('['+new Date().toString()+'] resizing jpeg ' + jpegFile);
			fs.readFile(jpegFile, function (err, data) {

				if(err) {
					logger.error('error reading file !' + err);
				}	
				else
				{
					sharp(data).resize(1600,1200).max().toBuffer()
					.then(function (imgResized) {
						logger.log('['+new Date().toString()+'] sending jpeg ' + jpegFile );
						resolve({ 
							src: 'data:image/jpeg;base64,' + imgResized.toString('base64'),
							id: uniqueFileName});
							
						
						
						
						
						//res.status(200).send(data.toString('base64'));
						
						var output = path.join(that.outputDir, uniqueFileName + '.jpg');
						fs.move(jpegFile, output, function (err) {
							if(err) {
								logger.error('cannot move file ' + jpegFile + ' to ' + output );
							} else {
								logger.log('jpeg copied to ' + output );
							}
						 
						});
					}).catch(function(err) {
						logger.error(err);
						reject(err);
						//res.status(500).send(err);
					});
					
				}
			});
		});
	},
	
	_processRaw: function (rawFile, uniqueFileName) {
		var logger = this.logger, that = this;
		return new Promise(function (resolve, reject) {
			//copy raw file to output dir. 
			var output = path.join(that.outputDir, uniqueFileName + '.cr2');
			fs.move(rawFile, output, function (err) {
				if(err) {
					logger.error('cannot move file ' + rawFile + ' to ' + output );
					reject('cannot move raw file ' + rawFile + ' to ' + output);
				} else {
					logger.log('raw copied to ' + output );
					resolve();
				}
			 
			})
		});
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

