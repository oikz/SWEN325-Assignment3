import {Component, ElementRef, ViewChild} from '@angular/core';
import {Geolocation, Position} from '@capacitor/geolocation';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {CapacitorGoogleMaps} from '@capacitor-community/capacitor-googlemaps-native';
import {DeviceOrientation, DeviceOrientationCompassHeading} from '@awesome-cordova-plugins/device-orientation/ngx';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  @ViewChild('map') mapView: ElementRef;
  id = '0';
  heading = 0;
  orientationListener: Subscription;
  refreshInterval: any;

  constructor(private auth: AuthService, private router: Router, private deviceOrientation: DeviceOrientation) {
  }

  ionViewDidEnter() {
    this.createMap().then(async () => {
      this.refreshInterval = setInterval(async () => {
        const position = await Geolocation.getCurrentPosition();
        await this.updateMap(position);
      }, 500);
    });

    // Listen for changes in the device orientation and autorotate the map
    this.orientationListener = this.deviceOrientation.watchHeading().subscribe(
      (data: DeviceOrientationCompassHeading) => this.heading = data.magneticHeading
    );
  }

  ionViewDidLeave() {
    CapacitorGoogleMaps.close();
    Geolocation.clearWatch({id: this.id});
    this.orientationListener.unsubscribe();
    clearInterval(this.refreshInterval);
  }

  /**
   * Create the map and display it on the screen
   */
  async createMap() {
    const coordinates = (await Geolocation.getCurrentPosition()).coords;
    const boundingRect = this.mapView.nativeElement.getBoundingClientRect() as DOMRect;

    await CapacitorGoogleMaps.create({
      width: Math.round(boundingRect.width),
      height: Math.round(boundingRect.height),
      x: Math.round(boundingRect.x),
      y: Math.round(boundingRect.y),
      zoom: 18,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
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
  }

  /**
   * Update the map by moving it to the current position, and adding an indicator of where the user is
   *
   * @param position The current position
   */
  async updateMap(position: Position) {
    await CapacitorGoogleMaps.clear();
    await CapacitorGoogleMaps.addCircle({
      center: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      radius: 2,
      fillColor: '#ffff00',
      strokeColor: '#ffff00',
      strokeWidth: 1,
    });

    // Rotate the map to the current heading
    await CapacitorGoogleMaps.setCamera({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      animate: true,
      bearing: this.heading,
    });
  }

  /**
   * Logout the current user and redirect them to the welcome page
   */
  logout() {
    this.auth.logout();
    this.router.navigate(['']);
  }
}
