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
		this.logData.time = new Date().getTime();
		this.io.emit('log-message', this.logData);
		console.log( '[debug] ' + msg);
	},
	log: function (msg) {
		this.logData.logLevel = 2;
		this.logData.message = msg;
		this.logData.time = new Date().getTime();
		this.io.emit('log-message', this.logData);
		console.log( '[log] ' + msg);
	},
	warn: function (msg) {
		this.logData.logLevel = 3;
		this.logData.message = msg;
		this.logData.time = new Date().getTime();
		this.io.emit('log-message', this.logData);
		console.log( '[warn] ' + msg);
	},
	error: function (msg) {
		this.logData.logLevel = 4;
		this.logData.message = msg;
		this.logData.time = new Date().getTime();
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

