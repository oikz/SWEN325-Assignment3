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
  earliestDate = 0;

  constructor(public firestoreService: FirestoreService) {
    this.firestoreService.getLocations().subscribe((locations) => {
      this.displayGraph(locations);
    });
  }

  ngAfterViewInit() {
    Chart.register(...registerables);
  }

  displayGraph(locations: any) {
    this.locations = locations;
    const distances = [];
    const timestamps = [];
    if (this.earliestDate !== 0) {
      const now = new Date().getTime();
      const filterTime = now - this.earliestDate * 60 * 60 * 1000;
      locations = locations.filter((loc) => loc.timestamp > filterTime);
    }
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
          label: 'Distance',
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)'
          ],
          data: distances
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            /*time: {
              unit: 'day',
            },*/
            adapters: {
              date: {
                locale: enNZ
              }
            },
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Distance travelled (Metres)'
            }
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

  setPointTimeframe(timeframe: number) {
    this.earliestDate = timeframe;
    this.firestoreService.getLocations().subscribe((locations) => {
        this.displayGraph(locations);
      }
    );
  }
}

