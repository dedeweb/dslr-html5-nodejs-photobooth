import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {TranslateModule} from 'ng2-translate';

import { AppComponent } from './app.component';
import { CameraStreamComponent } from './camera-stream/camera-stream.component';

@NgModule({
  declarations: [
    AppComponent,
    CameraStreamComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
	TranslateModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
