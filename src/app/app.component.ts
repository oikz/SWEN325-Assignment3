import {Component} from '@angular/core';
import {Auth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {FirestoreService} from './services/firestore.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

/**
 * The root component of the application
 * Displays either the welcome page or the tabs page depending on whether the user is logged in or not
 */
export class AppComponent {
  constructor(private auth: Auth, private router: Router, private firestoreService: FirestoreService) {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.router.navigate(['/tabs']);
      } else {
        this.router.navigate(['/welcome']);
      }
    });
  }
}
