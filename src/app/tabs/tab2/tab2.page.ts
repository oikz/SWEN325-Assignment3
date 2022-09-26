import {Component, ElementRef, ViewChild} from '@angular/core';
import {GoogleMap} from '@capacitor/google-maps';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  @ViewChild('map') mapRef: ElementRef;
  map: GoogleMap;

  constructor() {

  }

  ionViewDidEnter() {
    this.createMap();
  }

  async createMap() {
    this.map = await GoogleMap.create({
      id: 'my-map',
      apiKey: 'AIzaSyAZfmwK5h1tQgPlYQT2cwe6JVCtzQWRxdE',
      config: {
        center: {
          lat: -41.2924,
          lng: 174.7784
        },
        zoom: 8
      },
      element: this.mapRef.nativeElement,
    });
  }
}
