import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CameraService} from 'camera.service';

@Component({
  selector: 'photo-display',
  templateUrl: './photo-display.component.html',
  styleUrls: ['./photo-display.component.scss']
})
export class PhotoDisplayComponent implements OnInit {

  @Input() imgSrc: string;
  @Output() onRestart: EventEmitter<any> = new EventEmitter();
  @Output() onPrint: EventEmitter<any> = new EventEmitter();

  private canPrint = false;

  constructor(private cameraService : CameraService) { }

  ngOnInit() {
    this.cameraService.canPrint().subscribe(
      (data: string) => {
        this.canPrint = (data === "true");
        },
      () => {
        this.canPrint = false;
      });
  }

  public restart(): void {
    this.onRestart.emit();
  }

  public print(): void {
    this.onPrint.emit();
  }
}
