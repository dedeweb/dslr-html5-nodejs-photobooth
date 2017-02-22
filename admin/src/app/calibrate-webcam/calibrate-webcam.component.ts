import { Component, ElementRef } from '@angular/core';
import {CameraService} from 'camera.service';
import { LogService } from 'log.service';
import {TranslateService} from 'ng2-translate';
declare var Cropper : any;

@Component({
	selector: 'app-calibrate-webcam',
	templateUrl: './calibrate-webcam.component.html',
	styleUrls: ['./calibrate-webcam.component.scss']
})
export class CalibrateWebcamComponent {
	public webcamImgSrc : string = "";
	public cameraImgSrc : string = "";
	private cropper: any;
	private webcamCoords: any = null;
	public loading: boolean = false;
	public errorMsg: string = "";
	public infoMsg: string = "";
	
	constructor(
		private cameraService : CameraService,
		private el: ElementRef,
		private logger: LogService,
		public translate: TranslateService) {
		var that = this;
		cameraService.onWebcamImageReceived = function (image) {
			that.webcamImgSrc = image;
			if(that.loading && that.cameraImgSrc) {
				that.loading = false;
			}
		};
		
		cameraService.onCameraImageReceived = function (image) {
			that.cameraImgSrc = image;
			if(that.loading && that.webcamImgSrc) {
				that.loading = false;
			}
		};
		that.loading = true;
		that.errorMsg  = '';
		cameraService.getWebcamCoords().subscribe(
			function success(data) {
			  if(data.text()) {
				  logger.log('retrieved coords : ' + JSON.stringify(data.json()));
				  that.webcamCoords = data.json();
				  that.bindCropperData();
				} else {
				  logger.log('coords null');
				}
				that.loading = false;
			},
			function error(data) {
				logger.error('cannot get coords : ' + data);
				that.loading = false;
				translate.get('webcam_coords_error').subscribe(function (res :string)  {
					that.errorMsg = res + " : " +data;
				});
				
			}
		);
	}

	public storeCoords() {
		var that = this;
		var cropperData = this.cropper.getData(),
			imageData = this.cropper.getImageData();
		this.webcamCoords = {
			x: cropperData.x / imageData.naturalWidth,
			y: cropperData.y / imageData.naturalHeight,
			width: cropperData.width / imageData.naturalWidth,
			height: cropperData.height / imageData.naturalHeight
		};
		
		
		
		this.logger.log('store coords : ' + JSON.stringify(this.webcamCoords));
		this.loading = true;
		this.errorMsg = '';
		this.infoMsg = '';
		
		that.cameraService.setWebcamCoords(this.webcamCoords).subscribe(
			function success() {
				that.logger.log('coords successfully stored ! ');
				that.translate.get('webcam_coords_store_ok').subscribe(function (res :string)  {
					that.infoMsg = res;
				});
				that.loading = false;
			}, function error(data) {
				that.loading = false;
				that.logger.error('error storing coords ! ' + data);
				that.translate.get('webcam_coords_save_error').subscribe(function (res :string)  {
					that.errorMsg = res + " : " +data;
				});
			});
	}
	
	private bindCropperData() {
		if(this.cropper && this.webcamCoords) {
			let imageData =  this.cropper.getImageData();
			this.cropper.setData({ 
				x: imageData.naturalWidth * this.webcamCoords.x,
				y: imageData.naturalHeight* this.webcamCoords.y,
				width: imageData.naturalWidth * this.webcamCoords.width,
				height: imageData.naturalHeight * this.webcamCoords.height,
				rotate:0,
				scaleX:1,
				scaleY:1
			});
		}
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
		  viewMode: 1//,
		  //data: this.webcamCoords
		});
		this.bindCropperData();
	}
	
	public onResize(event) {
		this.logger.log('window resize');
        this.initCropper();
    }
	
	
	
	public  requestCalibration() {
		this.loading = true;
		this.infoMsg = '';
		this.errorMsg = '';
		this.cameraService.requestImages();
	}

}
