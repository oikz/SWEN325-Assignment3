import {Component, ElementRef, ViewChild} from '@angular/core';
import {Geolocation, Position} from '@capacitor/geolocation';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {CapacitorGoogleMaps} from '@capacitor-community/capacitor-googlemaps-native';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  @ViewChild('map') mapView: ElementRef;
  coordinates: Position['coords'];

  constructor(private auth: AuthService, private router: Router) {
  }

  ionViewDidEnter() {
    Geolocation.watchPosition({
      enableHighAccuracy: true,
    }, (position) => {
      this.coordinates = position.coords;
    }).then(async () => {
      await this.createMap();
    });
  }

  ionViewDidLeave() {
    CapacitorGoogleMaps.close();
  }

  async createMap() {
    const boundingRect = this.mapView.nativeElement.getBoundingClientRect() as DOMRect;
    console.log(boundingRect);
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });

    await CapacitorGoogleMaps.create({
      width: Math.round(boundingRect.width),
      height: Math.round(boundingRect.height),
      x: Math.round(boundingRect.x),
      y: Math.round(boundingRect.y),
      zoom: 18,
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
      liteMode: true,
    });

    CapacitorGoogleMaps.addListener('onMapReady', async () => {
      await CapacitorGoogleMaps.setMapType({
        type: 'hybrid'
      });
    });

    await CapacitorGoogleMaps.settings({
      zoomGestures: false,
      scrollGestures: false,
      tiltGestures: false,
      rotateGestures: false,
      allowScrollGesturesDuringRotateOrZoom: false,
      compassButton: false,
      myLocationButton: false,
      consumesGesturesInView: false,
      indoorPicker: false,
    });

    await CapacitorGoogleMaps.addCircle({
      center: {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
      },
      radius: 2,
      fillColor: '#ffff00',
      strokeColor: '#ffff00',
      strokeWidth: 1,
    });

    await CapacitorGoogleMaps.setCamera({
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['']);
  }
}
