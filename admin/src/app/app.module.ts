import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule  } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
import { CameraService } from 'camera.service';
import { AppComponent } from './app.component';
import { CalibrateWebcamComponent } from './calibrate-webcam/calibrate-webcam.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { LogComponent } from './log/log.component';
import { LogService, LogModule } from 'log.service';
import { LogEntryComponent } from './log-entry/log-entry.component';
import { ScrollGlueDirective } from './scroll-glue.directive';
import { KioskAppService } from './kioskapp.service';
import { P2pStreamService } from './p2p-stream.service';
import { ToasterModule } from 'angular2-toaster';
import { Http } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';





const appRoutes: Routes = [
  {path: '', component: ControlPanelComponent},
  {path: 'calibrate', component: CalibrateWebcamComponent},
  {path: 'log', component: LogComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    CalibrateWebcamComponent,
    ControlPanelComponent,
    LogComponent,
    LogEntryComponent,
    ScrollGlueDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
            deps: [Http]
        }),
    RouterModule.forRoot(appRoutes),
    ToasterModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [
    CameraService,
    KioskAppService,
    {
      provide: LogService, useFactory : function () {
        let logService =  new LogService(LogModule.Admin);
        logService.plugLogEvents();
        return logService;
      }
    },
    P2pStreamService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
