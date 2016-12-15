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
	plugEvents: function (socket) {
		var that = this;
		this.moduleArray[socket.id] = -1;
		
		socket.on('log-message', function (data) {
			if(data) {
				console.log('log received : ' + data.message);
			} else {
				console.log('empty log received.');	
			}
			
			socket.broadcast.emit('log-message', data);
		});
		
		socket.on('log-connect', function (data) { 
			that.moduleArray[socket.id] = data;
			if(that.checkConnection(data)) {
				//module already connected ! 
				that.nberOfConnection[data] = (that.nberOfConnection[data] ? that.nberOfConnection[data] + 1 : 1);
			} else {
				that.nberOfConnection[data] = 0;
			}
			console.log('log connect ' + that.moduleArray[socket.id]);
			socket.broadcast.emit('log-connect', data);
			
			for(var i in that.moduleArray) {
				
				if(that.moduleArray[i] !== -1) {
					console.log('log connect refresh ' + that.moduleArray[i]);
					socket.emit('log-connect', that.moduleArray[i] );
				}
			}
		});
		
		socket.on('disconnect', function () {
			console.log('log disconnect ' + that.moduleArray[socket.id]);
			that.nberOfConnection[that.moduleArray[socket.id]] --;
			socket.broadcast.emit('log-disconnect', that.moduleArray[socket.id] );
			that.moduleArray[socket.id] = -1;
			
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

