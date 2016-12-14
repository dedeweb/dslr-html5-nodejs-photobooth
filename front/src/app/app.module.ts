import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {TranslateModule} from 'ng2-translate';
import {P2pStreamService} from './p2p-stream.service';
import { AppComponent } from './app.component';
import { LogService, LogModule } from 'log.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
	TranslateModule.forRoot()
  ],
  providers: [ 
	P2pStreamService,
	{ provide: LogService, useFactory : function () { return new LogService(LogModule.FrontEnd);} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
