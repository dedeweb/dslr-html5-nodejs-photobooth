import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {TranslateModule} from 'ng2-translate';
import {P2pStreamService} from './p2p-stream.service';
import { AppComponent } from './app.component';

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
  providers: [ P2pStreamService ],
  bootstrap: [AppComponent]
})
export class AppModule { }