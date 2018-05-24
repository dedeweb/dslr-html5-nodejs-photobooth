import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'print-choice',
  templateUrl: './print-choice.component.html',
  styleUrls: ['./print-choice.component.scss']
})
export class PrintChoiceComponent {


  @Input() imgSrc: string;
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  @Output() onPrintChoice: EventEmitter<number> = new EventEmitter<number>();

  private maxNbrOfCopies = 5;
  private arrayCopies: any;
  private printJobSent = false;

  constructor() {
    this.arrayCopies =  Array(this.maxNbrOfCopies).fill(0).map(function (x, i) { return i + 1; });
  }

  public printPicture(nber: number): void {
    this.printJobSent = true;
    this.onPrintChoice.emit(nber);
  }

  public cancel(): void {
    this.onCancel.emit();
  }

}
