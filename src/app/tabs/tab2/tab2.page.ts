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
/**
 * Tab 2 Page for the app - shows the user's saved locations and allows them to view them on a map
 */
export class Tab2Page {
  @ViewChild('map') mapView: ElementRef;
  earliestDate = 24;

  /**
   * Constructor for the Tab2Page that initializes the fields.
   * Subscribes to the locations in Firebase and updates the map when they change.
   * Calls the updateMap function to draw the lines between the locations.
   *
   * @param firestoreService the firestore service
   * @param auth the authentication service
   * @param router the router
   */
  constructor(public firestoreService: FirestoreService, private auth: AuthService, private router: Router) {
    this.firestoreService.getLocations().subscribe((locations) => {
      this.updateMap(locations);
    });
  }

  /**
   * Creates the map when the page is loaded.
   */
  ionViewDidEnter() {
    this.createMap();
  }

  /**
   * Create the map.
   */
  async createMap() {
    const boundingRect = this.mapView.nativeElement.getBoundingClientRect() as DOMRect;
    console.log(boundingRect);
    const coordinates = await Geolocation.getCurrentPosition();

    await CapacitorGoogleMaps.create({
      width: Math.round(boundingRect.width),
      height: Math.round(boundingRect.height),
      x: Math.round(boundingRect.x),
      y: Math.round(boundingRect.y),
      zoom: 13,
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
    });

    CapacitorGoogleMaps.addListener('onMapReady', async () => {
      await CapacitorGoogleMaps.setMapType({
        type: 'hybrid'
      });
    });
  }

  /**
   * Close the map when the page is destroyed
   */
  ionViewDidLeave() {
    CapacitorGoogleMaps.close();
  }

  /**
   * Delete a location from Firebase using the id of the location
   *
   * @param pos the id of the location to delete
   */
  deleteLocation(pos) {
    this.firestoreService.deleteLocation(pos);
  }

  /**
   * Update the map lines between locations visited
   * Only draws lines between locations that are within the timeframe set by the user
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

  /**
   * Change the timeframe for which the map lines are drawn
   * And then update the map
   *
   * @param timeframe
   */
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
