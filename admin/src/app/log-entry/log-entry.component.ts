import { Component, OnInit, Input } from '@angular/core';
import { LogMessage, LogModule } from 'log.service';
@Component({
  selector: 'app-log-entry',
  templateUrl: './log-entry.component.html',
  styleUrls: ['./log-entry.component.scss']
})
export class LogEntryComponent implements OnInit {
	@Input() entry : LogMessage;
	public LogModule = LogModule;

	constructor() { }

	ngOnInit() {
	}

}
