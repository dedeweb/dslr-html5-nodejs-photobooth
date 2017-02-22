var colors = require('colors/safe');
var moment = require('moment');
var fs = require('fs');

var instance = null;
function LogSignaling(io){
	if(instance !== null){
		throw new Error("Cannot instantiate more than one LogSignaling, use LogSignaling.getInstance()");
	} 
	
	this.initialize(io);
}
LogSignaling.prototype = {
	initialize: function(io){
		this.io = io;
		this.cameraReady = false;
		this.moduleArray= [];
		this.nberOfConnection = [];
	},
	isAlreadyConnected : function (module) {
		return (typeof(this.nberOfConnection[module]) !== 'undefined' && this.nberOfConnection[module] > 0);
	},
	plugEvents: function (socket) {
		var that = this;
		this.moduleArray[socket.id] = null;

		socket.on('log-message', function (data) {
			that.signalLog(data);
		}); 
		
		socket.on('log-connect', function (data) { 
			
			that.moduleArray[socket.id] = data;
			
			if(typeof(that.nberOfConnection[data.module]) === 'undefined') {
				that.nberOfConnection[data.module] = 1;
			} else {
				that.nberOfConnection[data.module] ++;
			}
			
			var address = socket.request.connection.remoteAddress;
			//convert to v4 if needed
			if (address.substr(0, 7) == "::ffff:") {
			  address = address.substr(7)
			}	
			that.moduleArray[socket.id].address = address;			
			console.log(colors.green('[logger] log connect id=' +socket.id+ ' moduleData=' + JSON.stringify(that.moduleArray[socket.id]) ));
			
			socket.broadcast.emit('log-connect', that.moduleArray[socket.id]);
			
			for(var i in that.moduleArray) {
				
				if(that.moduleArray[i]) {
					console.log(colors.green('[logger] log connect refresh ' + JSON.stringify(that.moduleArray[i])));
					socket.emit('log-connect', that.moduleArray[i] );
				}
			}
			
			//console.log(that.nberOfConnection);
			//console.log(that.moduleArray);
		});
		
		socket.on('disconnect', function () {
			console.log(colors.green('[logger] log disconnect id=' + socket.id + ' moduleData=' + JSON.stringify(that.moduleArray[socket.id]) ));
			if(that.moduleArray[socket.id]) {
				that.nberOfConnection[that.moduleArray[socket.id].module] --;
				socket.broadcast.emit('log-disconnect', that.moduleArray[socket.id] );
				that.moduleArray[socket.id] = null;
			}
			//console.log(that.nberOfConnection);
			//console.log(that.moduleArray);			
		});
		
	},
	signalLog: function (data) {
		
		if(data) {
			var message =  data.message;
			var color = colors.black;
			
			
			
			switch(data.logLevel) {
				case 1: //debug
					message = '[debug] ' + message;
					color = colors.green;
					break;
				case 2: //info
					message = '[info] ' + message;
					color= colors.yellow;
					break;
				case 3: //warning
					message = '[warning] ' + message;
					color= colors.magenta.inverse;
					break;
				case 4: //error
					message = '[error] ' + message;
					color = colors.redBG;
					break;
			}
			
			switch(data.module) {
				case 1: //server
					message = '[server]' + message;
					break;
				case 2: //FrontEnd
					message = '[front]' + message;
					break;
				case 3: //Admin
					message = '[admin]' + message;
					break;
				case 4: //CameraCapture
					message = '[webcam]' + message;
					break;
			}
			
			message =  '[' + moment(data.time).format('ddd MMM DD HH:mm:ss.SS') + ']'  + message;
			
			console.log(color(message));
			fs.appendFile('tamerbooth.log', message + '\n');
			this.io.emit('log-message', data);
		} else {
			console.log(colors.redBG('empty log received.'));	
		}
	}
	
};
LogSignaling.getInstance = function(io){
	// summary:
	//      Gets an instance of the singleton. It is better to use 
	
	if(instance === null){
		instance = new LogSignaling(io);
	}
	return instance;
};

exports = module.exports = LogSignaling.getInstance;

