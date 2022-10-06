import {Component, ElementRef, ViewChild} from '@angular/core';
import {CapacitorGoogleMaps} from '@capacitor-community/capacitor-googlemaps-native';
import {Geolocation} from '@capacitor/geolocation';
import {FirestoreService} from '../../services/firestore.service';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  @ViewChild('map') mapView: ElementRef;
  earliestDate = 24;

  constructor(public firestoreService: FirestoreService, private auth: AuthService, private router: Router) {
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
    const earliestDateToNow = now - this.earliestDate * 60 * 60 * 1000;
    const filteredLocations = locations.filter((loc) => loc.timestamp > earliestDateToNow);

    // create the points to be drawn,
    // only take into account the points that are not too far away from each other
    const points = [];
    let prevLoc = null;
    for (const location of filteredLocations) {
      if (!prevLoc) {
        points.push({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        prevLoc = location;
        continue;
      }
      // if the time difference between the previous location and the current location is too big,
      // don't draw a line between them
      if ((prevLoc.timestamp - location.timestamp) < 600000) { // 10 minutes
        points.push({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        prevLoc = location;
        continue;
      }
      prevLoc = location;
    }

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

  /**
   * Logout the current user and redirect them to the welcome page
   */
  logout() {
    this.auth.logout();
    this.router.navigate(['']);
    CapacitorGoogleMaps.close();
  }
}
