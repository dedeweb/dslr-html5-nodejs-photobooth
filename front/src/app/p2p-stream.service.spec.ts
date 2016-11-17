/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { P2pStreamService } from './p2p-stream.service';

describe('Service: P2pStream', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [P2pStreamService]
    });
  });

  it('should ...', inject([P2pStreamService], (service: P2pStreamService) => {
    expect(service).toBeTruthy();
  }));
});
