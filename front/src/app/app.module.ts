import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
import { P2pStreamService } from './p2p-stream.service';
import { AppComponent } from './app.component';
import { LogService, LogModule } from 'log.service';
import { CameraService } from 'camera.service';
import { CountdownComponent } from './countdown/countdown.component';
import { PhotoCountdownComponent } from './photo-countdown/photo-countdown.component';
import { PhotoDisplayComponent } from './photo-display/photo-display.component';
import { PrintChoiceComponent } from './print-choice/print-choice.component';
import { BackgroundVideoComponent } from './background-video/background-video.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    CountdownComponent,
    PhotoCountdownComponent,
    PhotoDisplayComponent,
    PrintChoiceComponent,
    BackgroundVideoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
            deps: [Http]
        })
  ],
  providers: [
    P2pStreamService,
    CameraService,
    { provide: LogService, useFactory : function () { return new LogService(LogModule.FrontEnd); } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
