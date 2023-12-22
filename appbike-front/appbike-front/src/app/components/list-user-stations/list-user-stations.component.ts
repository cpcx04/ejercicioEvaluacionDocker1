import { Component } from '@angular/core';
import { StationsService } from '../../services/stations.service';
import { Station } from '../../models/list-all-stations';
import { Loader } from '@googlemaps/js-api-loader';
import { Router } from '@angular/router';
import { ErrorHandlerService } from '../../services/error-handler.service';

@Component({
  selector: 'app-list-user-stations',
  templateUrl: './list-user-stations.component.html',
  styleUrl: './list-user-stations.component.css'
})
export class ListUserStationsComponent {
  stations: Station[] = [];
  map: google.maps.Map | undefined;
  markers: google.maps.Marker[] = [];

  constructor(private stationService: StationsService, private router: Router, private errorHandler: ErrorHandlerService) { }

  ngOnInit(): void {
    this.stationService.getAllStations().subscribe({
      next: data => {
        this.stations = data;
        this.initMap();
      },
      error: err => {
        this.errorHandler.handleHttpError
      }
    })
  }

  showOnMap(): void {
    if (!this.map) return;

    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];

    this.stations.forEach(station => {
  
      const stationNow = station.bikes;
      let iconUrl = '';
      let clickable = true;

      if (stationNow > 0) {
        iconUrl = 'assets/img/bikes.png';
      } else {
        iconUrl = 'assets/img/fullStation.png';
        clickable = false; 
      }

      const coordinates = station.coordinates.split(',');
      const latitude = parseFloat(coordinates[0]);
      const longitude = parseFloat(coordinates[1]);

      const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: this.map,
        title: station.name,
        clickable: clickable,
        icon: { 
          url: iconUrl,
          scaledSize: new google.maps.Size(65, 65)
        }
      });

      this.markers.push(marker);
    
      if (clickable) {
        marker.addListener('click', () => {
          this.router.navigate(['/rentbystation', station.id]);
        })
      };
    });

  }

  initMap(): void {
    const loader = new Loader({
      apiKey: "AIzaSyDtpcf5htnmyWhR26aWh9dEtyp9wqf2fxc",
      version: "weekly"
    });

    loader.load().then(() => {
      this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        center: { lat: 37.3891, lng: -5.9845 },
        zoom: 14,
      });
      this.showOnMap();
    }).catch(error => {
      console.error("Error al cargar la API de Google Maps:", error);
    });
  }
}
