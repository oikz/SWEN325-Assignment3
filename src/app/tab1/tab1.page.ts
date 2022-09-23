import {Component} from '@angular/core';
import {Geolocation, Position} from '@capacitor/geolocation';
import {AccelListenerEvent, Motion} from '@capacitor/motion';
import {PluginListenerHandle} from '@capacitor/core';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  coordinates: Position['coords'];
  accelHandler: PluginListenerHandle;
  event: AccelListenerEvent;

  constructor() {
    this.information();
  }

  /**
   * Display Geolocation and Motion Data
   */
  async information() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.coordinates = coordinates.coords;

    this.accelHandler = await Motion.addListener('accel', event => {
      this.event = event;
    });
  }
}
