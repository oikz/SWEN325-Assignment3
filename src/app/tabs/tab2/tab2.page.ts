import {Component, ElementRef, ViewChild} from '@angular/core';
import {CapacitorGoogleMaps} from '@capacitor-community/capacitor-googlemaps-native';
import {Geolocation} from '@capacitor/geolocation';
import {FirestoreService} from '../../services/firestore.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  @ViewChild('map') mapView: ElementRef;
  isTracking = false;
  watch: string = null;
  lastTime = 0;
  earliestDate = 24;

  constructor(public firestoreService: FirestoreService) {
    this.firestoreService.getLocations().subscribe((locations) => {
      this.updateMap(locations);
    });
  }

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
  }

  ionViewDidLeave() {
    CapacitorGoogleMaps.close();
  }


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

  // Unsubscribe from the geolocation watch using the initial ID
  stopTracking() {
    Geolocation.clearWatch({id: this.watch}).then(() => {
      this.isTracking = false;
    });
  }

  // Delete a location from Firebase
  deleteLocation(pos) {
    this.firestoreService.deleteLocation(pos);
  }

  /**
   * Update the map lines between locations visited
   *
   * @param locations locations to draw lines between
   */
  async updateMap(locations: any) {
    // draw a line between the locations visited in last this.earliestDate hours
    const now = new Date().getTime();
    const last24Hours = now - this.earliestDate * 60 * 60 * 1000;
    const filteredLocations = locations.filter((loc) => loc.timestamp > last24Hours);

    const points = filteredLocations.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
      })
    );

    //clear map
    await CapacitorGoogleMaps.clear();
    //add points
    if (points.length > 0) {
      CapacitorGoogleMaps.addPolyline({
        points,
      });
    }
  }

  setPointTimeframe(timeframe: number) {
    this.earliestDate = timeframe;
    this.firestoreService.getLocations().subscribe((locations) => {
        this.updateMap(locations);
      }
    );
  }
}
