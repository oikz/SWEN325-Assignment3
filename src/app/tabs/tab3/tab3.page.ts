import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  @ViewChild('chart') chartElementRef: ElementRef;
  chart: Chart;
  locations: Observable<any>;
  locationsCollection: AngularFirestoreCollection<any>;
  user = null;
  isTracking = false;
  watch: string = null;
  lastTime = 0;


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

      //update map
      this.locations.subscribe((locations) => {
        //this.displayGraph(locations);
      });
    });
  }

  ngOnInit() {
    const context = this.chartElementRef.nativeElement;
    this.displayGraph(null);
  }

  displayGraph(locations: any) {
    this.chart = new Chart(this.chartElementRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
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


}
