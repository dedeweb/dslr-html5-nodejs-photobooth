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

  ngOnInit() {
    // this.onComplete.emit([clickedEntry, this.query]);
    this.currentStep = this.duration;
    this.animate = false;
    if (this.startAfter) {
      setTimeout(() => {this.launchCountDown(); }, this.startAfter * 1000);
    } else {
      this.launchCountDown();
    }
  }

  private launchCountDown() {
    this.animate = true;
    let updateCountDown = () => {
      this.currentStep --;
      if (this.currentStep > 0 ) {
        setTimeout(updateCountDown, 2000);
      } else {
        this.animate = false;
        this.onComplete.emit();
      }
    };
    setTimeout(updateCountDown, 2000);
  }
}
