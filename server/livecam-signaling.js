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
				that.logger.debug('camera ready.');
				socketCamera = socket;
			} else {
				that.logger.debug('camera unavailble.');	
			}
			that.cameraReady = data;
			
			socket.broadcast.emit('camera-ready', data);
		});
		
		socket.on('request-camera-stream', function () { 
			socket.broadcast.emit('request-camera-stream');
		});
		
		socket.on('disconnect', function () {
			that.logger.debug('client disconnect');
			if(socket === socketCamera) {
				that.cameraReady = false;
				socket.broadcast.emit('camera-ready', false);
			}
			
		});
		
		socket.on('camera-connect', function (data) {
			that.logger.debug('camera is ready');
			//console.log(JSON.stringify(data));
			
			socket.broadcast.emit('camera-connect', data);
		});
		
		socket.on('camera-client-connect', function (data) { 
			that.logger.debug('client is ready');
			that.logger.debug(JSON.stringify(data));
			
			socket.broadcast.emit('camera-client-connect', data);
		});
		
		socket.on('camera-ice-candidate', function (data) {
			that.logger.debug('camera ICE : \n' + JSON.stringify(data));
			socket.broadcast.emit('camera-ice-candidate', data);
		});
		socket.on('camera-client-ice-candidate', function (data) {
			that.logger.debug('client ICE : \n' + JSON.stringify(data));
			socket.broadcast.emit('camera-client-ice-candidate', data);
		});
		
		socket.on('webcam-image', function (img) {
			socket.broadcast.emit('webcam-image', img);
		});
		if(that.cameraReady) {
			socket.emit('camera-ready', true);
		}
		
		socket.on('front-playing', function (data) { 
			socket.broadcast.emit('front-playing', data);
		});
		
		socket.on('front-local-enumerate', function (data) { 
			socket.broadcast.emit('front-local-enumerate', data);
		});
		
		socket.on('front-select-local-device', function (data) { 
			socket.broadcast.emit('front-select-local-device', data);
		});
		
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

