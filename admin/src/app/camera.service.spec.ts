/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CameraService } from './camera.service';

describe('Service: Camera', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CameraService]
    });
  });

  it('should ...', inject([CameraService], (service: CameraService) => {
    expect(service).toBeTruthy();
  }));
});
