var colors = require('colors/safe');
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

