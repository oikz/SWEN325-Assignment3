import {Component, ElementRef, ViewChild} from '@angular/core';
import {CapacitorGoogleMaps} from '@capacitor-community/capacitor-googlemaps-native';
import {Geolocation} from '@capacitor/geolocation';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  @ViewChild('map') mapView: ElementRef;

  ionViewDidEnter() {
    this.createMap();
  }

  async createMap() {
    const boundingRect = this.mapView.nativeElement.getBoundingClientRect() as DOMRect;
    console.log(boundingRect);
    const coordinates = await Geolocation.getCurrentPosition();

    await CapacitorGoogleMaps.create({
      width: Math.round(boundingRect.width),
      height: Math.round(boundingRect.height),
      x: Math.round(boundingRect.x),
      y: Math.round(boundingRect.y),
      zoom: 10,
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
    });

    CapacitorGoogleMaps.addListener('onMapReady', async () => {
      await CapacitorGoogleMaps.setMapType({
        type: 'hybrid'
      });
    });

    CapacitorGoogleMaps.addPolyline({
      points: [
        {latitude: -41.276825, longitude: 174.777969},
        {latitude: -41.25, longitude: 174.70},
        {latitude: -41.20, longitude: 174.65},
      ],
    });
  }

  ionViewDidLeave() {
    CapacitorGoogleMaps.close();
  }
}
