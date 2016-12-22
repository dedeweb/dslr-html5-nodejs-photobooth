var instance = null;
function LiveCamSignaling(){
	if(instance !== null){
		throw new Error("Cannot instantiate more than one LiveCamSignaling, use LiveCamSignaling.getInstance()");
	} 
	
	this.initialize();
}
LiveCamSignaling.prototype = {
	initialize: function(){
		this.cameraReady = false;
		
	},
	plugEvents: function (socket) {
		var that = this;
		var socketCamera;
		
		socket.on('camera-ready', function (data) {
			if(data) {
				console.log('camera ready.');
				socketCamera = socket;
			} else {
				console.log('camera unavailble.');	
			}
			that.cameraReady = data;
			
			socket.broadcast.emit('camera-ready', data);
		});
		
		socket.on('request-camera-stream', function () { 
			socket.broadcast.emit('request-camera-stream');
		});
		
		socket.on('disconnect', function () {
			console.log('client disconnect');
			if(socket === socketCamera) {
				that.cameraReady = false;
				socket.broadcast.emit('camera-ready', false);
			}
			
		});
		
		socket.on('camera-connect', function (data) {
			console.log('camera is ready');
			console.log(JSON.stringify(data));
			
			socket.broadcast.emit('camera-connect', data);
		});
		
		socket.on('camera-client-connect', function (data) { 
			console.log('client is ready');
			console.log(JSON.stringify(data));
			
			socket.broadcast.emit('camera-client-connect', data);
		});
		
		socket.on('camera-ice-candidate', function (data) {
			console.log('camera ICE : \n' + JSON.stringify(data));
			socket.broadcast.emit('camera-ice-candidate', data);
		});
		socket.on('camera-client-ice-candidate', function (data) {
			console.log('client ICE : \n' + JSON.stringify(data));
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
LiveCamSignaling.getInstance = function(){
	// summary:
	//      Gets an instance of the singleton. It is better to use 
	
	if(instance === null){
		instance = new LiveCamSignaling();
	}
	return instance;
};

exports = module.exports = LiveCamSignaling.getInstance();

