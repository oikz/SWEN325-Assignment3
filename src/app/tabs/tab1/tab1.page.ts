import {Component} from '@angular/core';
import {Geolocation, Position} from '@capacitor/geolocation';
import {AccelListenerEvent, Motion} from '@capacitor/motion';
import {PluginListenerHandle} from '@capacitor/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  coordinates: Position['coords'];
  accelHandler: PluginListenerHandle;
  event: AccelListenerEvent;

  constructor(private auth: AuthService, private router: Router) {
    this.setup();
    // Run this function every 5 seconds
    setInterval(async () => {
      await this.location();
    }, 1000);
  }

  /**
   * Set up motion listener
   */
  async setup() {
    this.accelHandler = await Motion.addListener('accel', event => {
      this.event = event;
      console.log(event);
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['']);
  }

  async location() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.coordinates = coordinates.coords;
  }
}
