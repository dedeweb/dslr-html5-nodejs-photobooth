import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'print-choice',
	templateUrl: './print-choice.component.html',
	styleUrls: ['./print-choice.component.scss']
})
export class PrintChoiceComponent implements OnInit {


	@Input() imgSrc: string;
	@Output() onCancel: EventEmitter<any> = new EventEmitter();
	@Output() onPrintChoice: EventEmitter<number> = new EventEmitter<number>();

	private maxNbrOfCopies: number = 5;
	private Array: any;
	private arrayCopies: any;
	private printJobSent:boolean = false;
	
	constructor() { 
		this.arrayCopies =  Array(this.maxNbrOfCopies).fill(0).map(function (x, i) { return i + 1; });
		
	}

	ngOnInit() {
	}
	
	printPicture(nber: number) {
		this.printJobSent = true;
		this.onPrintChoice.emit(nber);
	}
	
	cancel() {
		this.onCancel.emit();
	}

}
