import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/';
import { LogModule } from 'log.service';

declare var $ : any;

if (environment.production) {
  enableProdMode();
}

$.get('/api/authorizeModule/' + LogModule.FrontEnd ).done(function () {
  platformBrowserDynamic().bootstrapModule(AppModule);
}).fail(function (error) {
  $('app-root').hide();
  $('.app-err').append(error.responseText);
  $('.app-err').show();
});

