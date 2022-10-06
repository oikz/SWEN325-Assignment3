import {Component, ElementRef, ViewChild} from '@angular/core';
import {Geolocation, Position} from '@capacitor/geolocation';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {CapacitorGoogleMaps} from '@capacitor-community/capacitor-googlemaps-native';
import {DeviceOrientation} from '@awesome-cordova-plugins/device-orientation/ngx';
import {FirestoreService} from '../../services/firestore.service';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

/**
 * Tab 1 Page for the app - shows the current location of the user and allows them to begin tracking their location
 */
export class Tab1Page {
  @ViewChild('map') mapView: ElementRef;
  heading = 0;
  orientationInterval: any;
  refreshInterval: any;
  isTracking = false;
  watch: string = null;
  lastTime = 0;

  constructor(private auth: AuthService,
              private router: Router,
              private deviceOrientation: DeviceOrientation,
              private firestoreService: FirestoreService) {
  }

  /**
   * Set up the Map and start refreshing it every 500ms with the user's current position and heading based on compass
   */
  ionViewDidEnter() {
    this.createMap().then(() => {
      this.refreshInterval = setInterval(async () => {
        const position = await Geolocation.getCurrentPosition();
        await this.updateMap(position);
      }, 500);
      this.orientationInterval = setInterval(async () => {
        this.heading = (await this.deviceOrientation.getCurrentHeading()).magneticHeading;
      });
    });
  }

  /**
   * Destroy the map and stop refreshing it when leaving this page
   */
  ionViewDidLeave() {
    CapacitorGoogleMaps.close();
    clearInterval(this.orientationInterval);
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
    CapacitorGoogleMaps.close();
    console.log(this.orientationInterval);
    clearInterval(this.orientationInterval);
    clearInterval(this.refreshInterval);
  }

  /**
   * Start tracking the user's location and save it to the database
   */
  async startTracking() {
    this.isTracking = true;
    this.watch = await Geolocation.watchPosition({
      enableHighAccuracy: true,
    }, (position, err) => {
      if (err) {
        console.log(err);
        return;
      }
      //add every 10 seconds max
      if (position.timestamp - this.lastTime > 10000) {
        this.lastTime = position.timestamp;
        this.firestoreService.addLocation(position);
      }
    });
  }

  /**
   * Stop tracking the user's location
   */
  stopTracking() {
    Geolocation.clearWatch({id: this.watch}).then(() => {
      this.isTracking = false;
    });
  }
}
