var instance = null;
function LogClient(signaler){
	if(instance !== null){
		throw new Error("Cannot instantiate more than one LogClient, use LogClient.getInstance()");
	} 
	
	this.initialize(signaler);
}
LogClient.prototype = {
	initialize: function(signaler){	
		this.signaler = signaler;
		this.logData = {
			module: 1,
			logLevel: 1,
			message: '',
			time: new Date().getTime()
		};
	},
	debug: function (msg) {
		this.logData.logLevel = 1;
		this.logData.message = msg;
		this.logData.time = new Date().getTime();
		this.signaler.signalLog(this.logData);
	},
	log: function (msg) {
		this.logData.logLevel = 2;
		this.logData.message = msg;
		this.logData.time = new Date().getTime();
		this.signaler.signalLog(this.logData);
	},
	warn: function (msg) {
		this.logData.logLevel = 3;
		this.logData.message = msg;
		this.logData.time = new Date().getTime();
		this.signaler.signalLog(this.logData);
	},
	error: function (msg) {
		this.logData.logLevel = 4;
		this.logData.message = msg;
		this.logData.time = new Date().getTime();
		this.signaler.signalLog(this.logData);
	}
};
LogClient.getInstance = function(signaler){
	// summary:
	//      Gets an instance of the singleton. It is better to use 
	
	if(instance === null){
		instance = new LogClient(signaler);
	}
	return instance;
};

exports = module.exports = LogClient.getInstance;

