/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { KioskappService } from './kioskapp.service';

describe('Service: Kioskapp', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KioskappService]
    });
  });

  it('should ...', inject([KioskappService], (service: KioskappService) => {
    expect(service).toBeTruthy();
  }));
});
