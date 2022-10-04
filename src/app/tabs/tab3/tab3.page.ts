import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Chart, registerables} from 'chart.js';
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
    /*for (let i = 1; i < locations.length; i++) {
      const distance = Math.sqrt(
        Math.pow(Math.abs(locations[i].longitude - locations[i - 1].longitude), 2) +
        Math.pow(Math.abs(locations[i].latitude - locations[i - 1].latitude), 2)
      );
      distances.push(distance);
    }*/
    let prevLoc = null;
    for (const location of locations) {
      if (!prevLoc) {
        distances.push(0);
        prevLoc = location;
        continue;
      }
      /*const distance = Math.sqrt(
        Math.pow(Math.abs(location.longitude - prevLoc.longitude), 2) +
        Math.pow(Math.abs(location.latitude - prevLoc.latitude), 2)
      );*/
      const distance = this.measure(location.latitude, location.longitude, prevLoc.latitude, prevLoc.longitude);
      prevLoc = location;
      console.log('distance ' + distance);
      distances.push(distance);
    }


    this.chart = new Chart(this.chartElementRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: distances,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
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
