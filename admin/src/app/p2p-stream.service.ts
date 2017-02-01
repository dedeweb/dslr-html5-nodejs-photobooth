import { Injectable } from '@angular/core';
import { LogService } from 'log.service';

declare var io:any;

@Injectable()
export class P2pStreamService {
	private socket: any;
	public cameraMode: number = -1;
	public devices: any[] = [];
	
	constructor( private logger: LogService) { 
		var that = this;
		this.socket = io( {path: '/api/socket'});
		
		this.socket.on('front-playing', function (remote : boolean) {
			logger.log('front is playing ! (remote = ' + remote + ')');
			if(remote) {
				that.cameraMode = 1;
			} else {
				that.cameraMode = 0;
			}
		});
		this.socket.on('front-local-enumerate', function (data : any[]) {
			logger.log('front device enumerate received');
			that.devices = data;
		});
	}
	
	public playLocalDevice(deviceId: number) {
		this.socket.emit('front-select-local-device', deviceId);
	}

}
