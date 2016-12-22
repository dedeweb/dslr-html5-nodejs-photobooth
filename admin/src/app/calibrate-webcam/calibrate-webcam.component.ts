import { Component, OnInit } from '@angular/core';
import {CameraService} from '../camera.service';

@Component({
	selector: 'app-calibrate-webcam',
	templateUrl: './calibrate-webcam.component.html',
	styleUrls: ['./calibrate-webcam.component.scss']
})
export class CalibrateWebcamComponent implements OnInit {
	public webcamImgSrc : string = "";
	constructor(private cameraService : CameraService) {
		var that = this;
		cameraService.onWebcamImageReceived = function (image) {
			that.webcamImgSrc = image;
		};
	}
	
	ngOnInit() {
	}
	
	public  requestCalibration() {
		this.cameraService.requestImages();
	}

}
