import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
/**
 * Firestore Service to be injected to each page that uses firebase data to allow Firebase Firestore
 */
export class FirestoreService {
  locations: Observable<any>;
  locationsCollection: AngularFirestoreCollection<any>;
  user = null;

  /**
   * Constructor for the FirestoreService that initializes the fields.
   *
   * @param afAuth the authentication service
   * @param afs the firestore service
   */
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

  /**
   * Returns the locations
   */
  getLocations() {
    return this.locations;
  }

  /**
   * Add a location to the firestore
   *
   * @param position the position to add
   */
  addLocation(position) {
    this.locationsCollection.add({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
    });
  }

  /**
   * Delete a location from the firestore
   *
   * @param location the location to delete
   */
  deleteLocation(location) {
    this.locationsCollection.doc(location.id).delete();
  }
}
