import { Component, OnInit, ElementRef } from '@angular/core';
import {CameraService} from '../camera.service';
import { LogService } from 'log.service';
declare var Cropper : any;

@Component({
	selector: 'app-calibrate-webcam',
	templateUrl: './calibrate-webcam.component.html',
	styleUrls: ['./calibrate-webcam.component.scss']
})
export class CalibrateWebcamComponent implements OnInit {
	public webcamImgSrc : string = "";
	private cropper: any;
	
	constructor(
		private cameraService : CameraService,
		private el: ElementRef,
		private logger: LogService) {
		var that = this;
		cameraService.onWebcamImageReceived = function (image) {
			that.webcamImgSrc = image;
		};
	}
	
	ngOnInit() {
	}
	
	public initCropper() {
		this.logger.log('launching cropper');
		var image = this.el.nativeElement.querySelector('#imageCropper img');
		if(this.cropper) {
			this.cropper.destroy();
		}
		this.cropper = new Cropper(image, {
		  aspectRatio: 3 / 2,
		  preview: '#croppedWebcamPreview',
		  zoomable: false,
		  crop: function(e) {
			//console.log(e.detail.x);
			//console.log(e.detail.y);
			//console.log(e.detail.width);
			//console.log(e.detail.height);
			//console.log(e.detail.rotate);
			//console.log(e.detail.scaleX);
			//console.log(e.detail.scaleY);
		  }
		});
	}
	
	public onResize(event) {
		this.logger.log('window resize');
        this.initCropper();
    }
	
	
	
	public  requestCalibration() {
		this.cameraService.requestImages();
	}

}
