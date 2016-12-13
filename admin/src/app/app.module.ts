import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import {TranslateModule} from 'ng2-translate';
import {CameraService} from './camera.service';
import { AppComponent } from './app.component';
import { CalibrateWebcamComponent } from './calibrate-webcam/calibrate-webcam.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { LogComponent } from './log/log.component';


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
	LogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
	TranslateModule.forRoot(),
    RouterModule.forRoot(appRoutes)
  ],
  providers: [CameraService],
  bootstrap: [AppComponent]
})
export class AppModule { }
