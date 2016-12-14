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
		
	},
	
	plugEvents: function (socket) {
		var that = this;
		this.currentModule = -1;
		socket.on('log-message', function (data) {
			if(data) {
				console.log('log received : ' + data.message);
			} else {
				console.log('empty log received.');	
			}
			
			socket.broadcast.emit('new-log', data);
		});
		
		socket.on('log-connect', function (data) { 
			that.currentModule = data;
			socket.broadcast.emit('log-connect', data);
		});
		
		socket.on('disconnect', function () {
			console.log('log disconnect');
			socket.broadcast.emit('log-disconnect', that.currentModule );
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

