/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CameraStreamComponent } from './camera-stream.component';

describe('CameraStreamComponent', () => {
  let component: CameraStreamComponent;
  let fixture: ComponentFixture<CameraStreamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CameraStreamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
