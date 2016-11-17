var instance = null;
var io;
function LiveCamSignaling(){
	if(instance !== null){
		throw new Error("Cannot instantiate more than one LiveCamSignaling, use LiveCamSignaling.getInstance()");
	} 
	
	this.initialize();
}
LiveCamSignaling.prototype = {
	initialize: function(server){
		
		//this.cameraOffer = false;
		var that = this;
		
		io.on('connection', function (socket) {
			console.log('user connected');
			socket.on('camera-ready', function (data) {
				console.log('camera is ready');
				console.log(JSON.stringify(data));
				that.cameraOffer = data;
				socket.broadcast.emit('camera-ready', data);
			});
			
			socket.on('camera-client-ready', function (data) { 
				console.log('client is ready');
				console.log(JSON.stringify(data));
				that.clientOffer = data;
				socket.broadcast.emit('camera-client-ready', data);
			});
			
			socket.on('camera-ice-candidate', function (data) {
				console.log('camera ICE : \n' + JSON.stringify(data));
				socket.broadcast.emit('camera-ice-candidate', data);
			});
			socket.on('camera-client-ice-candidate', function (data) {
				console.log('client ICE : \n' + JSON.stringify(data));
				socket.broadcast.emit('camera-client-ice-candidate', data);
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
			
		});
	},
	
};
LiveCamSignaling.getInstance = function(server){
	// summary:
	//      Gets an instance of the singleton. It is better to use 
	io = require('socket.io')(server, { path : '/api/socket/', origins : '*:*'});
	if(instance === null){
		instance = new LiveCamSignaling();
	}
	return instance;
};

exports = module.exports = LiveCamSignaling.getInstance;

