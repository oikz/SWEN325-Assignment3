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
  watch = null;

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
        // this.updateMap(locations);
      });
    });
  }

  ionViewDidEnter() {
    this.createMap().then(() => {
      this.loadMap();
    });
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

    // await CapacitorGoogleMaps.addPolyline({
    //   points: [
    //     {latitude: -41.276825, longitude: 174.777969},
    //     {latitude: -41.25, longitude: 174.70},
    //     {latitude: -41.20, longitude: 174.65},
    //   ],
    // });
  }

  ionViewDidLeave() {
    CapacitorGoogleMaps.close();
  }

  loadMap() {
    this.locations = this.locationsCollection.valueChanges();
    this.locations.subscribe((locations) => {
      locations.forEach((location) => {
        CapacitorGoogleMaps.addMarker({
          latitude: location.latitude,
          longitude: location.longitude,
          title: location.timestamp,
        });
      });
    });
  }

  startTracking() {
    this.isTracking = true;
    this.watch = Geolocation.watchPosition({}, (position, err) => {
      console.log('new position' + position.coords.latitude + ' ' + position.coords.longitude);
      if (err) {
        console.log(err);
        return;
      }
      this.locationsCollection.add({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().getTime(),
      });
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
    this.locationsCollection.doc(pos.id).delete();
  }
}
