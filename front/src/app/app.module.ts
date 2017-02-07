import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import {TranslateModule, TranslateLoader, TranslateStaticLoader} from 'ng2-translate';
import {P2pStreamService} from './p2p-stream.service';
import { AppComponent } from './app.component';
import { LogService, LogModule } from 'log.service';
import { CameraService } from 'camera.service';
import { CountdownComponent } from './countdown/countdown.component';

@NgModule({
  declarations: [
    AppComponent,
    CountdownComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
	TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
            deps: [Http]
        })
  ],
  providers: [ 
	P2pStreamService,
	CameraService,
	Location,
	{ provide: LogService, useFactory : function () { return new LogService(LogModule.FrontEnd);} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
