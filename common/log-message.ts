export enum LogModule {
	Server = 1,
	FrontEnd,
	Admin,
	CameraCapture
}

export enum LogLevel {
	Verbose = 1,
	Info,
	Warning,
	Error
}

export class LogMessage {
    public module: LogModule;
	public logLevel: LogLevel;
	public message: string;
	public time: number;
	constructor(module: LogModule,logLevel: LogLevel, message: string ) {
		this.module = module;
		this.logLevel = logLevel;
		this.message = message;
		this.time = new Date().getTime();
	}
}

export class LogConnectMessage {
	public module: LogModule;
	public address: string;
	constructor(module: LogModule, address: string) {
		this.module = module;
		this.address = address;
	}
}