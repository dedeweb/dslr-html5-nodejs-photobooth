import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
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
    HttpModule,
	TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
            deps: [Http]
        }),
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
	CameraService,
	KioskAppService,
	{ provide: LogService, useFactory : function () { 
		let logService =  new LogService(LogModule.Admin);
		logService.plugLogEvents();
		return logService;
	} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
