import { Component, OnInit } from '@angular/core';
import { LogService, LogLevel } from 'log.service';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {

	private logLevelKeys:string[];
	private LogLevel = LogLevel;
		
	constructor(public logger: LogService) { 
		this.logLevelKeys = Object.keys(this.LogLevel).filter(k => !isNaN(Number(k)));
	}

	ngOnInit() { 

	}
	
	private clearLog() {
		this.logger.logEntries = [];
	}

}
