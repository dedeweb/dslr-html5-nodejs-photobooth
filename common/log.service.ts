import { LogMessage, LogLevel, LogModule } from './log-message';
export  { LogModule } from './log-message';
declare var io:any;

export class LogService {
	public frontEndConnected: boolean;
	public adminConnected: boolean;
	public webcamConnected: boolean;
	
	private baseUrl: string = '/api';
	private socket : any;
	
	
	
	constructor(public curModule: LogModule) {
		
		this.socket = io( {path: '/api/socket'});
		
		this.socket.emit('log-connect', module);
		console.log('________ logger loaded : ' + LogModule[this.curModule] + ' ________' );
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
		var that = this;
		this.socket.on('log-connect', function(module: LogModule) {
			switch(module) {
				case LogModule.FrontEnd:
					that.frontEndConnected = true;
					break;
				case LogModule.Admin:
					that.adminConnected = true;
					break;
				case LogModule.CameraCapture:
					that.webcamConnected = true;
					break;
			}
		});
		
		this.socket.on('log-disconnect', function(module: LogModule) {
			switch(module) {
				case LogModule.FrontEnd:
					that.frontEndConnected = false;
					break;
				case LogModule.Admin:
					that.adminConnected = false;
					break;
				case LogModule.CameraCapture:
					that.webcamConnected = false;
					break;
			}
		});
		
		this.socket.on('log-message', function(data) {
		
		});
	}
}

