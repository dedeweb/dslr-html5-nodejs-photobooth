import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CameraService} from 'camera.service';

@Component({
	selector: 'photo-display',
	templateUrl: './photo-display.component.html',
	styleUrls: ['./photo-display.component.scss']
})
export class PhotoDisplayComponent implements OnInit {
	
	@Input() imgSrc: string;
	@Output() onRestart: EventEmitter<any> = new EventEmitter();
	@Output() onPrint: EventEmitter<any> = new EventEmitter();
	
	private canPrint:boolean = false;
	
	constructor(private cameraService : CameraService) { }

	ngOnInit() {
		var that = this;
		this.cameraService.canPrint().subscribe(
			function success(data) {
				that.canPrint = (data.text() === "true");
			}, 
			function error() {
				that.canPrint = false;
			});
	}
	
	restart() {
		this.onRestart.emit();
	}
	
	print() {
		this.onPrint.emit();
	}

}
