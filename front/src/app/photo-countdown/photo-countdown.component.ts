import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LogService } from 'log.service';

@Component({
	selector: 'photo-countdown',
	templateUrl: './photo-countdown.component.html',
	styleUrls: ['./photo-countdown.component.scss']
})
export class PhotoCountdownComponent implements OnInit {

	@Output() onFinish: EventEmitter<any> = new EventEmitter();
	@Output() onTriggerCapture: EventEmitter<any> = new EventEmitter();

	private currentStep: number = -1;

	constructor(private logger: LogService) { }

	ngOnInit() {
		this.launchCountDown();
	}
	
	launchCountDown() {
		var that = this;
		this.currentStep = -1;
		var updateCountDown = function () {
			that.currentStep = that.currentStep + 1;
			that.logger.debug('countdown:' + that.currentStep);
			if (that.currentStep === 0) {
				//first step (ready?) displayed longer
				setTimeout(updateCountDown, 3000);
			} else if (that.currentStep == 5) {
				//launching before end, as it takes about 2 sec to trigger capture.
				//that.capturePicture();
				that.onTriggerCapture.emit();
				setTimeout(updateCountDown, 1500);
			}else if (that.currentStep > 0 && that.currentStep < 6) {
				setTimeout(updateCountDown, 1500);
			} else {
				//exiting countdown
				that.onFinish.emit();
				
				//that.capturePicture();
			}
		}
		updateCountDown();
	}

}
