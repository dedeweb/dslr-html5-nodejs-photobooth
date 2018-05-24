import { Component } from '@angular/core';
import { LogService, LogLevel } from 'log.service';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent {

  public logLevelKeys: string[];
  private LogLevel = LogLevel;

  constructor(public logger: LogService) {
    this.logLevelKeys = Object.keys(this.LogLevel).filter(k => !isNaN(Number(k)));
  }

  public clearLog() {
    this.logger.logEntries = [];
  }
}
