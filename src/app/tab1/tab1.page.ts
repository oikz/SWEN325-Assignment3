import {Component} from '@angular/core';
import {Geolocation, Position} from '@capacitor/geolocation';
import {Motion} from '@capacitor/motion';
import {PluginListenerHandle} from '@capacitor/core';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  coords: Position['coords'];
  accelHandler: PluginListenerHandle;
  hello: any = 'before-er';

  constructor() {
  }

  async locate() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.coords = coordinates.coords;
  }

  async watch() {
    this.hello = 'before';
    //if ( device is ios do this)
    //await (DeviceMotionEvent as any).requestPermission();
    this.hello = 'hello';

    // Once the user approves, can start listening:
    this.accelHandler = await Motion.addListener('accel', event => {
      console.log('Device motion event:', event);
      this.hello = 'evented';
    });
  }
}
