import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit {

	@Input() duration: number;
	@Input() startAfter: number;
	@Input() theme: string;
	@Output() onComplete: EventEmitter<any> = new EventEmitter();
	
	private currentStep: number;
	private animate: boolean;
	constructor() {
		
	}

	ngOnInit() {
		// this.onComplete.emit([clickedEntry, this.query]);
		this.currentStep = this.duration;
		this.animate = false;
		let that = this;
		if(this.startAfter) {
			setTimeout(function () {that.launchCountDown();}, this.startAfter * 1000);
		} else {
			this.launchCountDown();
		}
	}
	
	private launchCountDown() {
		let that = this;
		that.animate = true;
		let updateCountDown = function () {
			
			that.currentStep --;
			if(that.currentStep > 0 ) {
				setTimeout(updateCountDown, 2000);
			} else {
				that.animate = false;
				that.onComplete.emit();
			}
		};
		setTimeout(updateCountDown, 2000);
	
	}

}
