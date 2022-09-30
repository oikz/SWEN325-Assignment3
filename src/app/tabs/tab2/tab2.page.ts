import {Component, ElementRef, ViewChild} from '@angular/core';
import {CapacitorGoogleMaps} from '@capacitor-community/capacitor-googlemaps-native';
import {Geolocation} from '@capacitor/geolocation';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  @ViewChild('map') mapView: ElementRef;
  locations: Observable<any>;
  locationsCollection: AngularFirestoreCollection<any>;
  user = null;
  isTracking = false;
  watch: string = null;
  lastTime = 0;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.afAuth.onAuthStateChanged((user) => {
      this.user = user;
      this.locationsCollection = this.afs.collection(
        'locations/' + user.uid + '/locations',
        ref => ref.orderBy('timestamp', 'desc')
      );

      //load locations
      this.locations = this.locationsCollection.snapshotChanges().pipe(
        map(actions => actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return {id, ...data};
          })
        )
      );

      //update map
      this.locations.subscribe((locations) => {
        this.updateMap(locations);
      });
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
        this.locationsCollection.add({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        });
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
    console.log(pos);
    this.locationsCollection.doc(pos.id).delete();
  }

  updateMap(locations: any) {
    // draw a line between the locations visited in last 24 hours
    //TODO: dont hardcode 24 hours
    const now = new Date().getTime();
    const last24Hours = now - 24 * 60 * 60 * 1000;
    const filteredLocations = locations.filter((loc) => loc.timestamp > last24Hours);

    const points = filteredLocations.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
      })
    );

    CapacitorGoogleMaps.addPolyline({
      points,
    });
  }

  //
  // updateMap(locations) {
  //   // Remove all current marker
  //   this.markers.map(marker => marker.setMap(null));
  //   this.markers = [];
  //
  //   for (let loc of locations) {
  //     let latLng = new google.maps.LatLng(loc.lat, loc.lng);
  //
  //     let marker = new google.maps.Marker({
  //       map: this.map,
  //       animation: google.maps.Animation.DROP,
  //       position: latLng
  //     });
  //     this.markers.push(marker);
  //   }
  // }
}
