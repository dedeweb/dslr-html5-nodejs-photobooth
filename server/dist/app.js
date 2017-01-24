/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {var express = __webpack_require__(1);
	var path = __webpack_require__(2);
	var favicon = __webpack_require__(3);
	var morgan = __webpack_require__(4);
	var cookieParser = __webpack_require__(5);
	var bodyParser = __webpack_require__(6);
	//var child = require('child_process');
	var app = express();
	var server = __webpack_require__(7).Server(app);
	var io = __webpack_require__(8)(server, { path : '/api/socket/', origins : '*:*'});
	var logger = __webpack_require__(9)(io);
	var cameraControl = __webpack_require__(10)(logger);
	var liveCamSignaling = __webpack_require__(15)(logger);
	var logSignaling = __webpack_require__(16);
	var Datastore = __webpack_require__(31);
	var db = new Datastore({filename: './tamerbooth.db'}); 
	db.loadDatabase(function(err) {
		if(err) {
			logger.error('Error loading db : ' + JSON.stringify(err));	
		} else  {
			logger.log('db loaded');
		}	
	});

	app.use(morgan('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());
	app.use(express.static(__dirname));


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
		cameraControl.getStatus(res);
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

	server.listen(3000, function () {
		logger.log('tamerbooth api listening on port 3000!');
	});

	module.exports = app;

	/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("serve-favicon");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("morgan");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("cookie-parser");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

/***/ },
/* 9 */
/***/ function(module, exports) {

	var instance = null;
	function LogClient(io){
		if(instance !== null){
			throw new Error("Cannot instantiate more than one LogClient, use LogClient.getInstance()");
		} 
		
		this.initialize(io);
	}
	LogClient.prototype = {
		initialize: function(io){	
			this.io = io;
			this.logData = {
				module: 1,
				logLevel: 1,
				message: ''
			};
		},
		debug: function (msg) {
			this.logData.logLevel = 1;
			this.logData.message = msg;
			this.io.emit('log-message', this.logData);
			console.log( '[debug] ' + msg);
		},
		log: function (msg) {
			this.logData.logLevel = 2;
			this.logData.message = msg;
			this.io.emit('log-message', this.logData);
			console.log( '[log] ' + msg);
		},
		warn: function (msg) {
			this.logData.logLevel = 3;
			this.logData.message = msg;
			this.io.emit('log-message', this.logData);
			console.log( '[warn] ' + msg);
		},
		error: function (msg) {
			this.logData.logLevel = 4;
			this.logData.message = msg;
			this.io.emit('log-message', this.logData);
			console.log( '[error] ' + msg);
		}
	};
	LogClient.getInstance = function(io){
		// summary:
		//      Gets an instance of the singleton. It is better to use 
		
		if(instance === null){
			instance = new LogClient(io);
		}
		return instance;
	};

	exports = module.exports = LogClient.getInstance;



/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__dirname) {var child = __webpack_require__(11);
	var process = __webpack_require__(12);
	var fs = __webpack_require__(13);
	var sharp = __webpack_require__(14);
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
				this.logger.error('get summary command response : ' + summaryCmd.stderr);
				//res.json( {error: true, message: ''+summaryCmd.stderr});
				res.json( {error: true, message: '' + summaryCmd.stderr});

			}
			else
			{
				this.logger.log('get summary command response : ' + summaryCmd.stdout);
				res.json( {error: false, message : '' + summaryCmd.stdout});
			}
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

				var jpegRegex = /Saving file as (.*)?\.jpg/g;
				var rawRegex = /Saving file as (.*)?\.cr2/g;

				captureCommand.stdout.on('data', function (data) {
					logger.log('[capture command]' + data);
					var match = jpegRegex.exec('' + data);
					if(match && match.length > 1 ) {
						var jpegFile = match[1] + '.jpg';
						shouldFailPromise = false;
						logger.log('['+new Date().toString()+'] resizing jpeg ' + jpegFile);
						fs.readFile(jpegFile, function (err, data) {

						  if(err) {
						    logger.error('error reading file !' + err);
	            }
	            else
	            {
	              sharp(data).resize(1600,1200).toBuffer()
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
	CameraControl.getInstance = function(logger){
		// summary:
		//      Gets an instance of the singleton. It is better to use
		if(instance === null){
			instance = new CameraControl(logger);
		}
		return instance;
	};

	exports = module.exports = CameraControl.getInstance;


	/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("child_process");

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("process");

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = require("sharp");

/***/ },
/* 15 */
/***/ function(module, exports) {

	var instance = null;
	function LiveCamSignaling(logger){
		if(instance !== null){
			throw new Error("Cannot instantiate more than one LiveCamSignaling, use LiveCamSignaling.getInstance()");
		} 
		
		this.initialize(logger);
	}
	LiveCamSignaling.prototype = {
		initialize: function(logger){
			this.cameraReady = false;
			this.logger = logger;
			
		},
		plugEvents: function (socket) {
			var that = this;
			var socketCamera;
			
			socket.on('camera-ready', function (data) {
				if(data) {
					that.logger.log('camera ready.');
					socketCamera = socket;
				} else {
					that.logger.log('camera unavailble.');	
				}
				that.cameraReady = data;
				
				socket.broadcast.emit('camera-ready', data);
			});
			
			socket.on('request-camera-stream', function () { 
				socket.broadcast.emit('request-camera-stream');
			});
			
			socket.on('disconnect', function () {
				that.logger.log('client disconnect');
				if(socket === socketCamera) {
					that.cameraReady = false;
					socket.broadcast.emit('camera-ready', false);
				}
				
			});
			
			socket.on('camera-connect', function (data) {
				that.logger.log('camera is ready');
				console.log(JSON.stringify(data));
				
				socket.broadcast.emit('camera-connect', data);
			});
			
			socket.on('camera-client-connect', function (data) { 
				that.logger.log('client is ready');
				that.logger.log(JSON.stringify(data));
				
				socket.broadcast.emit('camera-client-connect', data);
			});
			
			socket.on('camera-ice-candidate', function (data) {
				that.logger.log('camera ICE : \n' + JSON.stringify(data));
				socket.broadcast.emit('camera-ice-candidate', data);
			});
			socket.on('camera-client-ice-candidate', function (data) {
				that.logger.log('client ICE : \n' + JSON.stringify(data));
				socket.broadcast.emit('camera-client-ice-candidate', data);
			});
			
			socket.on('webcam-image', function (img) {
				socket.broadcast.emit('webcam-image', img);
			});
			if(that.cameraReady) {
				socket.emit('camera-ready', true);
			}
			
			/*
			if(that.cameraOffer) {
				//if cameraOffer already set, send it on connection to client;
				socket.emit('camera-ready', that.cameraOffer);
			}
			
			if(that.clientOffer) {
				//if clientOffer already set, send it on connection to client;
				socket.emit('camera-client-ready', that.clientOffer);
			}*/
		}
	};
	LiveCamSignaling.getInstance = function(logger){
		// summary:
		//      Gets an instance of the singleton. It is better to use 
		
		if(instance === null){
			instance = new LiveCamSignaling(logger);
		}
		return instance;
	};

	exports = module.exports = LiveCamSignaling.getInstance;



/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var colors = __webpack_require__(17);
	var instance = null;
	function LogSignaling(){
		if(instance !== null){
			throw new Error("Cannot instantiate more than one LogSignaling, use LogSignaling.getInstance()");
		} 
		
		this.initialize();
	}
	LogSignaling.prototype = {
		initialize: function(){
			this.cameraReady = false;
			this.moduleArray= [];
			this.nberOfConnection = [];
		},
		checkConnection : function (module) {
			for(var i in this.moduleArray) {
				if(this.moduleArray[i] === module) {
					return true;
				}
			}
			return false;
		},
		isAlreadyConnected : function (module) {
			return (this.nberOfConnection[module] && this.nberOfConnection[module] > 0);
		},
		plugEvents: function (socket, io) {
			var that = this;
			this.moduleArray[socket.id] = null;
			
			socket.on('log-message', function (data) {
				if(data) {
					console.log(colors.magenta('    [remote]log received : ' + data.message ));
				} else {
					console.log('    [remote]empty log received.'.gray);	
				}
				
				io.emit('log-message', data);
			});
			
			socket.on('log-connect', function (data) { 
				that.moduleArray[socket.id] = data;
				if(that.checkConnection(data.module)) {
					//module already connected ! 
					that.nberOfConnection[data.module] = (that.nberOfConnection[data.module] ? that.nberOfConnection[data] + 1 : 1);
				} else {
					that.nberOfConnection[data.module] = 0;
				}
				var address = socket.request.connection.remoteAddress;
				//convert to v4 if needed
				if (address.substr(0, 7) == "::ffff:") {
				  address = address.substr(7)
				}	
				data.address = address;			
				console.log(colors.magenta('    [remote] log connect id=' +socket.id+ ' moduleData=' + JSON.stringify(that.moduleArray[socket.id]) ));
				
				socket.broadcast.emit('log-connect', data);
				
				for(var i in that.moduleArray) {
					
					if(that.moduleArray[i]) {
						console.log(colors.magenta('    [remote] log connect refresh ' + JSON.stringify(that.moduleArray[i])));
						socket.emit('log-connect', that.moduleArray[i] );
					}
				}
			});
			
			socket.on('disconnect', function () {
				console.log(colors.magenta('    [remote] log disconnect id=' + socket.id + ' moduleData=' + JSON.stringify(that.moduleArray[socket.id]) ));
				if(that.moduleArray[socket.id]) {
					that.nberOfConnection[that.moduleArray[socket.id].module] --;
					socket.broadcast.emit('log-disconnect', that.moduleArray[socket.id] );
					that.moduleArray[socket.id] = null;
				}			
			});
			
		}
	};
	LogSignaling.getInstance = function(){
		// summary:
		//      Gets an instance of the singleton. It is better to use 
		
		if(instance === null){
			instance = new LogSignaling();
		}
		return instance;
	};

	exports = module.exports = LogSignaling.getInstance();



/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {//
	// Remark: Requiring this file will use the "safe" colors API which will not touch String.prototype
	//
	//   var colors = require('colors/safe);
	//   colors.red("foo")
	//
	//
	var colors = __webpack_require__(19);
	module['exports'] = colors;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/*

	The MIT License (MIT)

	Original Library 
	  - Copyright (c) Marak Squires

	Additional functionality
	 - Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var colors = {};
	module['exports'] = colors;

	colors.themes = {};

	var ansiStyles = colors.styles = __webpack_require__(20);
	var defineProps = Object.defineProperties;

	colors.supportsColor = __webpack_require__(21);

	if (typeof colors.enabled === "undefined") {
	  colors.enabled = colors.supportsColor;
	}

	colors.stripColors = colors.strip = function(str){
	  return ("" + str).replace(/\x1B\[\d+m/g, '');
	};


	var stylize = colors.stylize = function stylize (str, style) {
	  if (!colors.enabled) {
	    return str+'';
	  }

	  return ansiStyles[style].open + str + ansiStyles[style].close;
	}

	var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
	var escapeStringRegexp = function (str) {
	  if (typeof str !== 'string') {
	    throw new TypeError('Expected a string');
	  }
	  return str.replace(matchOperatorsRe,  '\\$&');
	}

	function build(_styles) {
	  var builder = function builder() {
	    return applyStyle.apply(builder, arguments);
	  };
	  builder._styles = _styles;
	  // __proto__ is used because we must return a function, but there is
	  // no way to create a function with a different prototype.
	  builder.__proto__ = proto;
	  return builder;
	}

	var styles = (function () {
	  var ret = {};
	  ansiStyles.grey = ansiStyles.gray;
	  Object.keys(ansiStyles).forEach(function (key) {
	    ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
	    ret[key] = {
	      get: function () {
	        return build(this._styles.concat(key));
	      }
	    };
	  });
	  return ret;
	})();

	var proto = defineProps(function colors() {}, styles);

	function applyStyle() {
	  var args = arguments;
	  var argsLen = args.length;
	  var str = argsLen !== 0 && String(arguments[0]);
	  if (argsLen > 1) {
	    for (var a = 1; a < argsLen; a++) {
	      str += ' ' + args[a];
	    }
	  }

	  if (!colors.enabled || !str) {
	    return str;
	  }

	  var nestedStyles = this._styles;

	  var i = nestedStyles.length;
	  while (i--) {
	    var code = ansiStyles[nestedStyles[i]];
	    str = code.open + str.replace(code.closeRe, code.open) + code.close;
	  }

	  return str;
	}

	function applyTheme (theme) {
	  for (var style in theme) {
	    (function(style){
	      colors[style] = function(str){
	        if (typeof theme[style] === 'object'){
	          var out = str;
	          for (var i in theme[style]){
	            out = colors[theme[style][i]](out);
	          }
	          return out;
	        }
	        return colors[theme[style]](str);
	      };
	    })(style)
	  }
	}

	colors.setTheme = function (theme) {
	  if (typeof theme === 'string') {
	    try {
	      colors.themes[theme] = __webpack_require__(22)(theme);
	      applyTheme(colors.themes[theme]);
	      return colors.themes[theme];
	    } catch (err) {
	      console.log(err);
	      return err;
	    }
	  } else {
	    applyTheme(theme);
	  }
	};

	function init() {
	  var ret = {};
	  Object.keys(styles).forEach(function (name) {
	    ret[name] = {
	      get: function () {
	        return build([name]);
	      }
	    };
	  });
	  return ret;
	}

	var sequencer = function sequencer (map, str) {
	  var exploded = str.split(""), i = 0;
	  exploded = exploded.map(map);
	  return exploded.join("");
	};

	// custom formatter methods
	colors.trap = __webpack_require__(23);
	colors.zalgo = __webpack_require__(24);

	// maps
	colors.maps = {};
	colors.maps.america = __webpack_require__(27);
	colors.maps.zebra = __webpack_require__(30);
	colors.maps.rainbow = __webpack_require__(28);
	colors.maps.random = __webpack_require__(29)

	for (var map in colors.maps) {
	  (function(map){
	    colors[map] = function (str) {
	      return sequencer(colors.maps[map], str);
	    }
	  })(map)
	}

	defineProps(colors, init());
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/*
	The MIT License (MIT)

	Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var styles = {};
	module['exports'] = styles;

	var codes = {
	  reset: [0, 0],

	  bold: [1, 22],
	  dim: [2, 22],
	  italic: [3, 23],
	  underline: [4, 24],
	  inverse: [7, 27],
	  hidden: [8, 28],
	  strikethrough: [9, 29],

	  black: [30, 39],
	  red: [31, 39],
	  green: [32, 39],
	  yellow: [33, 39],
	  blue: [34, 39],
	  magenta: [35, 39],
	  cyan: [36, 39],
	  white: [37, 39],
	  gray: [90, 39],
	  grey: [90, 39],

	  bgBlack: [40, 49],
	  bgRed: [41, 49],
	  bgGreen: [42, 49],
	  bgYellow: [43, 49],
	  bgBlue: [44, 49],
	  bgMagenta: [45, 49],
	  bgCyan: [46, 49],
	  bgWhite: [47, 49],

	  // legacy styles for colors pre v1.0.0
	  blackBG: [40, 49],
	  redBG: [41, 49],
	  greenBG: [42, 49],
	  yellowBG: [43, 49],
	  blueBG: [44, 49],
	  magentaBG: [45, 49],
	  cyanBG: [46, 49],
	  whiteBG: [47, 49]

	};

	Object.keys(codes).forEach(function (key) {
	  var val = codes[key];
	  var style = styles[key] = [];
	  style.open = '\u001b[' + val[0] + 'm';
	  style.close = '\u001b[' + val[1] + 'm';
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 21 */
/***/ function(module, exports) {

	/*
	The MIT License (MIT)

	Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var argv = process.argv;

	module.exports = (function () {
	  if (argv.indexOf('--no-color') !== -1 ||
	    argv.indexOf('--color=false') !== -1) {
	    return false;
	  }

	  if (argv.indexOf('--color') !== -1 ||
	    argv.indexOf('--color=true') !== -1 ||
	    argv.indexOf('--color=always') !== -1) {
	    return true;
	  }

	  if (process.stdout && !process.stdout.isTTY) {
	    return false;
	  }

	  if (process.platform === 'win32') {
	    return true;
	  }

	  if ('COLORTERM' in process.env) {
	    return true;
	  }

	  if (process.env.TERM === 'dumb') {
	    return false;
	  }

	  if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
	    return true;
	  }

	  return false;
	})();

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./colors": 19,
		"./colors.js": 19,
		"./custom/trap": 23,
		"./custom/trap.js": 23,
		"./custom/zalgo": 24,
		"./custom/zalgo.js": 24,
		"./extendStringPrototype": 25,
		"./extendStringPrototype.js": 25,
		"./index": 26,
		"./index.js": 26,
		"./maps/america": 27,
		"./maps/america.js": 27,
		"./maps/rainbow": 28,
		"./maps/rainbow.js": 28,
		"./maps/random": 29,
		"./maps/random.js": 29,
		"./maps/zebra": 30,
		"./maps/zebra.js": 30,
		"./styles": 20,
		"./styles.js": 20,
		"./system/supports-colors": 21,
		"./system/supports-colors.js": 21
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 22;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {module['exports'] = function runTheTrap (text, options) {
	  var result = "";
	  text = text || "Run the trap, drop the bass";
	  text = text.split('');
	  var trap = {
	    a: ["\u0040", "\u0104", "\u023a", "\u0245", "\u0394", "\u039b", "\u0414"],
	    b: ["\u00df", "\u0181", "\u0243", "\u026e", "\u03b2", "\u0e3f"],
	    c: ["\u00a9", "\u023b", "\u03fe"],
	    d: ["\u00d0", "\u018a", "\u0500" , "\u0501" ,"\u0502", "\u0503"],
	    e: ["\u00cb", "\u0115", "\u018e", "\u0258", "\u03a3", "\u03be", "\u04bc", "\u0a6c"],
	    f: ["\u04fa"],
	    g: ["\u0262"],
	    h: ["\u0126", "\u0195", "\u04a2", "\u04ba", "\u04c7", "\u050a"],
	    i: ["\u0f0f"],
	    j: ["\u0134"],
	    k: ["\u0138", "\u04a0", "\u04c3", "\u051e"],
	    l: ["\u0139"],
	    m: ["\u028d", "\u04cd", "\u04ce", "\u0520", "\u0521", "\u0d69"],
	    n: ["\u00d1", "\u014b", "\u019d", "\u0376", "\u03a0", "\u048a"],
	    o: ["\u00d8", "\u00f5", "\u00f8", "\u01fe", "\u0298", "\u047a", "\u05dd", "\u06dd", "\u0e4f"],
	    p: ["\u01f7", "\u048e"],
	    q: ["\u09cd"],
	    r: ["\u00ae", "\u01a6", "\u0210", "\u024c", "\u0280", "\u042f"],
	    s: ["\u00a7", "\u03de", "\u03df", "\u03e8"],
	    t: ["\u0141", "\u0166", "\u0373"],
	    u: ["\u01b1", "\u054d"],
	    v: ["\u05d8"],
	    w: ["\u0428", "\u0460", "\u047c", "\u0d70"],
	    x: ["\u04b2", "\u04fe", "\u04fc", "\u04fd"],
	    y: ["\u00a5", "\u04b0", "\u04cb"],
	    z: ["\u01b5", "\u0240"]
	  }
	  text.forEach(function(c){
	    c = c.toLowerCase();
	    var chars = trap[c] || [" "];
	    var rand = Math.floor(Math.random() * chars.length);
	    if (typeof trap[c] !== "undefined") {
	      result += trap[c][rand];
	    } else {
	      result += c;
	    }
	  });
	  return result;

	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {// please no
	module['exports'] = function zalgo(text, options) {
	  text = text || "   he is here   ";
	  var soul = {
	    "up" : [
	      '̍', '̎', '̄', '̅',
	      '̿', '̑', '̆', '̐',
	      '͒', '͗', '͑', '̇',
	      '̈', '̊', '͂', '̓',
	      '̈', '͊', '͋', '͌',
	      '̃', '̂', '̌', '͐',
	      '̀', '́', '̋', '̏',
	      '̒', '̓', '̔', '̽',
	      '̉', 'ͣ', 'ͤ', 'ͥ',
	      'ͦ', 'ͧ', 'ͨ', 'ͩ',
	      'ͪ', 'ͫ', 'ͬ', 'ͭ',
	      'ͮ', 'ͯ', '̾', '͛',
	      '͆', '̚'
	    ],
	    "down" : [
	      '̖', '̗', '̘', '̙',
	      '̜', '̝', '̞', '̟',
	      '̠', '̤', '̥', '̦',
	      '̩', '̪', '̫', '̬',
	      '̭', '̮', '̯', '̰',
	      '̱', '̲', '̳', '̹',
	      '̺', '̻', '̼', 'ͅ',
	      '͇', '͈', '͉', '͍',
	      '͎', '͓', '͔', '͕',
	      '͖', '͙', '͚', '̣'
	    ],
	    "mid" : [
	      '̕', '̛', '̀', '́',
	      '͘', '̡', '̢', '̧',
	      '̨', '̴', '̵', '̶',
	      '͜', '͝', '͞',
	      '͟', '͠', '͢', '̸',
	      '̷', '͡', ' ҉'
	    ]
	  },
	  all = [].concat(soul.up, soul.down, soul.mid),
	  zalgo = {};

	  function randomNumber(range) {
	    var r = Math.floor(Math.random() * range);
	    return r;
	  }

	  function is_char(character) {
	    var bool = false;
	    all.filter(function (i) {
	      bool = (i === character);
	    });
	    return bool;
	  }
	  

	  function heComes(text, options) {
	    var result = '', counts, l;
	    options = options || {};
	    options["up"] =   typeof options["up"]   !== 'undefined' ? options["up"]   : true;
	    options["mid"] =  typeof options["mid"]  !== 'undefined' ? options["mid"]  : true;
	    options["down"] = typeof options["down"] !== 'undefined' ? options["down"] : true;
	    options["size"] = typeof options["size"] !== 'undefined' ? options["size"] : "maxi";
	    text = text.split('');
	    for (l in text) {
	      if (is_char(l)) {
	        continue;
	      }
	      result = result + text[l];
	      counts = {"up" : 0, "down" : 0, "mid" : 0};
	      switch (options.size) {
	      case 'mini':
	        counts.up = randomNumber(8);
	        counts.mid = randomNumber(2);
	        counts.down = randomNumber(8);
	        break;
	      case 'maxi':
	        counts.up = randomNumber(16) + 3;
	        counts.mid = randomNumber(4) + 1;
	        counts.down = randomNumber(64) + 3;
	        break;
	      default:
	        counts.up = randomNumber(8) + 1;
	        counts.mid = randomNumber(6) / 2;
	        counts.down = randomNumber(8) + 1;
	        break;
	      }

	      var arr = ["up", "mid", "down"];
	      for (var d in arr) {
	        var index = arr[d];
	        for (var i = 0 ; i <= counts[index]; i++) {
	          if (options[index]) {
	            result = result + soul[index][randomNumber(soul[index].length)];
	          }
	        }
	      }
	    }
	    return result;
	  }
	  // don't summon him
	  return heComes(text, options);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(19);

	module['exports'] = function () {

	  //
	  // Extends prototype of native string object to allow for "foo".red syntax
	  //
	  var addProperty = function (color, func) {
	    String.prototype.__defineGetter__(color, func);
	  };

	  var sequencer = function sequencer (map, str) {
	      return function () {
	        var exploded = this.split(""), i = 0;
	        exploded = exploded.map(map);
	        return exploded.join("");
	      }
	  };

	  addProperty('strip', function () {
	    return colors.strip(this);
	  });

	  addProperty('stripColors', function () {
	    return colors.strip(this);
	  });

	  addProperty("trap", function(){
	    return colors.trap(this);
	  });

	  addProperty("zalgo", function(){
	    return colors.zalgo(this);
	  });

	  addProperty("zebra", function(){
	    return colors.zebra(this);
	  });

	  addProperty("rainbow", function(){
	    return colors.rainbow(this);
	  });

	  addProperty("random", function(){
	    return colors.random(this);
	  });

	  addProperty("america", function(){
	    return colors.america(this);
	  });

	  //
	  // Iterate through all default styles and colors
	  //
	  var x = Object.keys(colors.styles);
	  x.forEach(function (style) {
	    addProperty(style, function () {
	      return colors.stylize(this, style);
	    });
	  });

	  function applyTheme(theme) {
	    //
	    // Remark: This is a list of methods that exist
	    // on String that you should not overwrite.
	    //
	    var stringPrototypeBlacklist = [
	      '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', 'charAt', 'constructor',
	      'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf', 'charCodeAt',
	      'indexOf', 'lastIndexof', 'length', 'localeCompare', 'match', 'replace', 'search', 'slice', 'split', 'substring',
	      'toLocaleLowerCase', 'toLocaleUpperCase', 'toLowerCase', 'toUpperCase', 'trim', 'trimLeft', 'trimRight'
	    ];

	    Object.keys(theme).forEach(function (prop) {
	      if (stringPrototypeBlacklist.indexOf(prop) !== -1) {
	        console.log('warn: '.red + ('String.prototype' + prop).magenta + ' is probably something you don\'t want to override. Ignoring style name');
	      }
	      else {
	        if (typeof(theme[prop]) === 'string') {
	          colors[prop] = colors[theme[prop]];
	          addProperty(prop, function () {
	            return colors[theme[prop]](this);
	          });
	        }
	        else {
	          addProperty(prop, function () {
	            var ret = this;
	            for (var t = 0; t < theme[prop].length; t++) {
	              ret = colors[theme[prop][t]](ret);
	            }
	            return ret;
	          });
	        }
	      }
	    });
	  }

	  colors.setTheme = function (theme) {
	    if (typeof theme === 'string') {
	      try {
	        colors.themes[theme] = __webpack_require__(22)(theme);
	        applyTheme(colors.themes[theme]);
	        return colors.themes[theme];
	      } catch (err) {
	        console.log(err);
	        return err;
	      }
	    } else {
	      applyTheme(theme);
	    }
	  };

	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(19);
	module['exports'] = colors;

	// Remark: By default, colors will add style properties to String.prototype
	//
	// If you don't wish to extend String.prototype you can do this instead and native String will not be touched
	//
	//   var colors = require('colors/safe);
	//   colors.red("foo")
	//
	//
	__webpack_require__(25)();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(19);

	module['exports'] = (function() {
	  return function (letter, i, exploded) {
	    if(letter === " ") return letter;
	    switch(i%3) {
	      case 0: return colors.red(letter);
	      case 1: return colors.white(letter)
	      case 2: return colors.blue(letter)
	    }
	  }
	})();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(19);

	module['exports'] = (function () {
	  var rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta']; //RoY G BiV
	  return function (letter, i, exploded) {
	    if (letter === " ") {
	      return letter;
	    } else {
	      return colors[rainbowColors[i++ % rainbowColors.length]](letter);
	    }
	  };
	})();


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(19);

	module['exports'] = (function () {
	  var available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green', 'blue', 'white', 'cyan', 'magenta'];
	  return function(letter, i, exploded) {
	    return letter === " " ? letter : colors[available[Math.round(Math.random() * (available.length - 1))]](letter);
	  };
	})();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var colors = __webpack_require__(19);

	module['exports'] = function (letter, i, exploded) {
	  return i % 2 === 0 ? letter : colors.inverse(letter);
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = require("nedb");

/***/ }
/******/ ]);