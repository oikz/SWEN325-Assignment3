import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Chart, registerables} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {enNZ} from 'date-fns/locale';
import {FirestoreService} from '../../services/firestore.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements AfterViewInit {
  @ViewChild('chart') chartElementRef: ElementRef;
  chart: Chart;
  locations: any;

  constructor(public firestoreService: FirestoreService) {
    this.firestoreService.getLocations().subscribe((locations) => {
      this.displayGraph(locations);
    });
  }

  ngAfterViewInit() {
    Chart.register(...registerables);
  }

  displayGraph(locations: any) {
    console.log('loc a tions ' + locations.length);


    this.locations = locations;
    const distances = [];
    const timestamps = [];
    /*for (let i = 1; i < locations.length; i++) {
      const distance = Math.sqrt(
        Math.pow(Math.abs(locations[i].longitude - locations[i - 1].longitude), 2) +
        Math.pow(Math.abs(locations[i].latitude - locations[i - 1].latitude), 2)
      );
      distances.push(distance);
    }*/
    let prevLoc = null;
    for (const location of locations) {
      timestamps.push(location.timestamp);
      if (!prevLoc) {
        distances.push(0);
        prevLoc = location;
        continue;
      }
      const distance = this.measure(location.latitude, location.longitude, prevLoc.latitude, prevLoc.longitude);
      prevLoc = location;
      distances.push(distance);
    }

    this.chart = new Chart(this.chartElementRef.nativeElement, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [{
          label: 'Times',
          data: distances
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            /*time: {
              unit: 'week',
            },*/
            adapters: {
              date: {
                locale: enNZ
              }
            }
          },
          y: {
            beginAtZero: true
          },
        },
      }
    });
  }

  measure(lat1, lon1, lat2, lon2) {  // generally used geo measurement function
    const R = 6378.137; // Radius of earth in KM
    const dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    const dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d * 1000; // meters
  }
}

