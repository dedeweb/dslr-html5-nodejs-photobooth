import { LogMessage, LogLevel, LogModule, LogConnectMessage } from './log-message';
export  { LogModule, LogLevel, LogMessage, LogConnectMessage } from './log-message';
declare var io:any;

export class LogService {
	public frontEndConnected: boolean = false;
	public frontEndAddress: string = null;
	public adminConnected: boolean = false;
	public adminAddress: string = null;
	public webcamConnected: boolean = false;
	public webcamAddress: string = null;
	public logEntries : LogMessage[] = [];
	
	private socket : any;
	private eventPlugged : boolean = false;
	
	
	
	constructor(public curModule: LogModule) {
		
		this.socket = io( {path: '/api/socket'});
		
		
		this.socket.emit('log-connect', new LogConnectMessage(curModule, null));
		console.log('________ logger loaded : ' + LogModule[this.curModule] + ' ________' );
		this.log( LogModule[this.curModule] + ' connected' );
	}
	
	public debug(message: string) {
		let logMessage = new LogMessage(this.curModule, LogLevel.Verbose, message);
		this.socket.emit('log-message', logMessage);
		console.log( '[debug] ' + message);
	}
	
	public log(message: string) {
		let logMessage = new LogMessage(this.curModule, LogLevel.Info, message);
		this.socket.emit('log-message', logMessage);
		console.log( '[info] ' + message);
	}
	
	public warn(message: string) {
		let logMessage = new LogMessage(this.curModule, LogLevel.Warning, message);
		this.socket.emit('log-message', logMessage);
		console.log( '[warn] ' + message);
	}
	
	public error(message: string) {
		let logMessage = new LogMessage(this.curModule, LogLevel.Error, message);
		this.socket.emit('log-message', logMessage);
		console.error( '[error] ' + message);
	}
	
	public plugLogEvents() {
		if(!this.eventPlugged) {
			var that = this;
			
			this.socket.on('log-connect', function(logMsg: LogConnectMessage) {
				switch(logMsg.module) {
					case LogModule.FrontEnd:
						that.frontEndConnected = true;
						that.frontEndAddress = logMsg.address;
						break;
					case LogModule.Admin:
						that.adminConnected = true;
						that.adminAddress = logMsg.address;
						break;
					case LogModule.CameraCapture:
						that.webcamConnected = true;
						that.webcamAddress = logMsg.address;
						break;
				}
			});
			
			this.socket.on('log-disconnect', function(logMsg: LogConnectMessage) {
				switch(logMsg.module) {
					case LogModule.FrontEnd:
						that.frontEndConnected = false;
						that.frontEndAddress = null;
						break;
					case LogModule.Admin:
						that.adminConnected = false;
						that.adminAddress = null;
						break;
					case LogModule.CameraCapture:
						that.webcamConnected = false;
						that.webcamAddress = null;
						break;
				}
			});
			
			this.socket.on('log-message', function(logEntry : LogMessage) {
				that.logEntries.push(logEntry);
			});
			
			console.log('________ logger event plugged ________');
			this.eventPlugged = true;	
		}
		
	}
}

