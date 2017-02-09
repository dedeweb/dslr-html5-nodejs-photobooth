import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'photo-display',
	templateUrl: './photo-display.component.html',
	styleUrls: ['./photo-display.component.scss']
})
export class PhotoDisplayComponent implements OnInit {
	
	@Input() imgSrc: string;
	@Output() onRestart: EventEmitter<any> = new EventEmitter();
	@Output() onPrint: EventEmitter<any> = new EventEmitter();
	
	constructor() { }

	ngOnInit() {
	}
	
	restart() {
		this.onRestart.emit();
	}
	
	print() {
		this.onPrint.emit();
	}

}
