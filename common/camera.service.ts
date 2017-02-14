import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { LogService } from 'log.service';
//import 'rxjs/add/operator/catch';
declare var io:any;


@Injectable()
export class CameraService {
	private baseUrl: string = '/api';
	private socket: any;
	public onWebcamImageReceived: (image:any) => void;
	public onCameraImageReceived: (image:any) => void;
	
	constructor(private http : Http, private logger: LogService) {
		var that = this;
		this.socket = io( {path: '/api/socket'});
		
		
		this.socket.on('webcam-image', function (data) {
			logger.log('webcam-image received');
			if(that.onWebcamImageReceived) {
				that.onWebcamImageReceived(data);
			}
		});
		this.socket.on('camera-image', function (data) {
			logger.log('camera-image received');
			if(that.onCameraImageReceived) {
				that.onCameraImageReceived(data);
			}
		});
	}
	
	public getStatus() {
		let result = this.http
			.get(`${this.baseUrl}/cameraStatus`);
			
		
		return result;
	};  
	
	public getWebcamCoords() {
		let result = this.http
			.get(`${this.baseUrl}/webcamCrop`);
		return result;
	}
	
	public setWebcamCoords(coords: any) {
		let result = this.http
			.post(`${this.baseUrl}/webcamCrop`, coords);
		
		return result;
	};
	
	public getMode() {
		let result = this.http
			.get(`${this.baseUrl}/cameraMode`);
			
		
		return result;
	};
	
	public requestImages() {
		this.socket.emit('request-calibration-images');
		this.logger.log('Request calibration sent');
	};
	
	public captureImage() {
		let result = this.http
			.get(`${this.baseUrl}/captureImage`);
		return result;
	}
	
	public getPrintPreview(imgId:string) {
		let result = this.http
			.get(`${this.baseUrl}/printPreview/${imgId}`);
		return result;
	}
	
	public printImage(imgId:string, copies:number) {
		let result = this.http
			.post(`${this.baseUrl}/print/${imgId}`, {copies: copies});
		
		return result;
	}
	
	public setMode(mode: boolean) {
		let result = this.http
			.post(`${this.baseUrl}/cameraMode`, {fakeCamera: mode});
		
		return result;
	};
	
	public getOutputDir() {
		let result = this.http
			.get(`${this.baseUrl}/outputDir`);
			
		
		return result;
	};
	
	public setOutputDir(dir:string) {
		let result = this.http
			.post(`${this.baseUrl}/outputDir`, {dir: dir});
		
		return result;
	};
	
	public getPrinterInfos() {
		let result = this.http
			.get(`${this.baseUrl}/printerInfos`);
		
		return result;
	};
	
	public setCanPrint(canPrint:boolean) {
		let result = this.http
			.post(`${this.baseUrl}/canPrint`, canPrint);
		
		return result;
	};
	
	public canPrint() {
		let result = this.http
			.get(`${this.baseUrl}/canPrint`);
		
		return result;
	};
	
	public printCapacity() {
		let result = this.http
			.get(`${this.baseUrl}/printCapacity`);
		
		return result;
	};
	public setPrintCapacity(capacity:number) {
		let result = this.http
			.post(`${this.baseUrl}/printCapacity`, capacity);
		
		return result;
	};
	
	
	/*
	private getHeaders(){
		let headers = new Headers();
		headers.append('Accept', 'application/json');
		return headers;
	}*/
	  
	/*getAll(): Observable<Person[]>{
	let people$ = this.http
	  .get(`${this.baseUrl}/cameraStatus`, {headers: this.getHeaders()})
	  return people$;
	}
	*/

}
