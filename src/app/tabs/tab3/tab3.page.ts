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
  @ViewChild('chart1') chart1ElementRef: ElementRef;
  @ViewChild('chart2') chart2ElementRef: ElementRef;
  distChart: Chart;
  speedChart: Chart;
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
    const speeds = [];
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
      const distance = this.measureDistance(location.latitude, location.longitude, prevLoc.latitude, prevLoc.longitude);
      const speed = this.measureSpeed(distance, location.timestamp, prevLoc.timestamp);
      prevLoc = location;
      distances.push(distance);
      speeds.push(speed);
    }
    if (this.distChart) {
      this.distChart.destroy();
    }
    this.distChart = new Chart(this.chart1ElementRef.nativeElement, {
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
            ticks: {
              precision: 2
            },
            title: {
              display: true,
              text: 'Distance travelled (Metres)'
            }
          },
        },
      }
    });
    if (this.speedChart) {
      this.speedChart.destroy();
    }
    this.speedChart = new Chart(this.chart2ElementRef.nativeElement, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [{
          label: 'Speed',
          backgroundColor: [
            'rgba(100, 219, 63, 0.2)'
          ],
          borderColor: [
            'rgba(100, 219, 63,1)'
          ],
          data: speeds
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
            ticks: {
              precision: 2
            },
            title: {
              display: true,
              text: 'Speed (Metres/Second)'
            }
          },
        },
      }
    });
  }

  measureDistance(lat1, lon1, lat2, lon2) {  // generally used geo measurement function
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

  measureSpeed(dist, time1, time2) {
    const time = (time2 - time1) / 1000;
    return dist / time;
  }

  setPointTimeframe(timeframe: number) {
    this.earliestDate = timeframe;
    this.firestoreService.getLocations().subscribe((locations) => {
        this.displayGraph(locations);
      }
    );
  }
}

