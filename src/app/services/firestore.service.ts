import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  locations: Observable<any>;
  locationsCollection: AngularFirestoreCollection<any>;
  user = null;

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
    });
  }

  getLocations() {
    return this.locations;
  }

  addLocation(position) {
    this.locationsCollection.add({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
    });
  }

  deleteLocation(location) {
    this.locationsCollection.doc(location.id).delete();
  }
}
