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

  private currentStep = -1;

  constructor(private logger: LogService) { }

  ngOnInit() {
    this.launchCountDown();
  }

  public launchCountDown(): void {
    this.currentStep = -1;
    let updateCountDown = () => {
      this.currentStep = this.currentStep + 1;
      this.logger.debug('countdown:' + this.currentStep);
      if (this.currentStep === 0) {
        // first step (ready?) displayed longer
        setTimeout(updateCountDown, 3000);
      } else if (this.currentStep === 5) {
        // launching before end, as it takes about 2 sec to trigger capture.
        this.onTriggerCapture.emit();
        setTimeout(updateCountDown, 1500);
      } else if (this.currentStep > 0 && this.currentStep < 6) {
        setTimeout(updateCountDown, 1500);
      } else {
        // exiting countdown
        this.onFinish.emit();
      }
    };
    updateCountDown();
  }

}
