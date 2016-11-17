import { Component } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {P2pStreamService} from './p2p-stream.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  private currentStream : MediaStream = null;
  constructor(translate: TranslateService,
				private p2pStreamService : P2pStreamService) {
	var that = this;
	p2pStreamService.onAddStream = function(stream) {
		console.log('stream received. video tracks : ' + stream.getVideoTracks().length);
		if(stream.getVideoTracks().length> 0) {
			console.log('track : ' + JSON.stringify(stream.getVideoTracks()[0]));
		}
		stream.onaddtrack = function () {
			console.log('track added');
		};
		that.currentStream = stream;
	};
  }
}
