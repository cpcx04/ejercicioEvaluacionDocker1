import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { UsoService } from '../../services/uso.service';
import { UsoResponse } from '../../models/uso.interface';
import { Loader } from '@googlemaps/js-api-loader';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environments';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { TiempoTranscurridoService } from '../../services/tiempo-transcurrido.service';
import { StationsService } from '../../services/stations.service';
import { Station } from '../../models/list-all-stations';

@Component({
  selector: 'app-details-use-bar',
  templateUrl: './details-use-bar.component.html',
  styleUrl: './details-use-bar.component.css'
})
export class DetailsUseBarComponent implements OnChanges , OnInit {

  @Input() uso!: UsoResponse;
  fechaInicio: any;
  cost: number = 0;
  bike: any;
  tiempoTranscurrido: string = '00:00:00';  // Inicializar con el valor deseado
  intervalId: any;
  map: google.maps.Map | undefined;
  markers: google.maps.Marker[] = [];
  stations: Station[] = [];
  stationSelected !: Station;
  constructor(private modalService: NgbModal, private usoService: UsoService, private router: Router, private tiempoTranscurridoService: TiempoTranscurridoService,private stationService : StationsService ){ }

  ngOnInit(): void {
    this.usoService.getCurrentCost().subscribe(resp => {
      this.cost = resp.precioMinuto;
    })
    this.stationService.getAllStations().subscribe(resp => {
      this.stations = resp;
    });
    this.tiempoTranscurridoService.obtenerFecha(this.fechaInicio)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['uso'] && changes['uso'].currentValue) {
      const fechaEnCadena = this.uso.fechaInicio;
      //this.cost = this.uso.coste;
      this.fechaInicio = new Date(fechaEnCadena);
      this.bike = this.uso.bicicleta;
      this.iniciarContador();
    }
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

      if (stationNow != station.capacity) {
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
          this.finishTrip(station.id)
          this.modalService.dismissAll()
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

 /* ngOnDestroy(): void {
    this.detenerContador();
  }*/

  /*iniciarContador(): void {
    this.intervalId = setInterval(() => {
      if (this.fechaInicio) {
        const ahora = new Date();
        const diferencia = ahora.getTime() - this.fechaInicio.getTime();
        this.tiempoTranscurrido = this.formatoTiempo(diferencia);
      }
    }, 1000);
  }*/

  iniciarContador(): void {
    this.tiempoTranscurridoService.iniciarContador();
    this.intervalId = setInterval(() => {
      if (this.fechaInicio) {
        const ahora = new Date();
        const diferencia = ahora.getTime() - this.fechaInicio.getTime();
        this.tiempoTranscurrido = this.formatoTiempo(diferencia);
        this.tiempoTranscurridoService.actualizarTiempoTranscurrido(this.tiempoTranscurrido);
      }
    }, 1000);
  }

  detenerContador(): void {
    this.tiempoTranscurridoService.detenerContador();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  formatoTiempo(milliseconds: number): string {
    const segundos = Math.floor(milliseconds / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);

    const formatoHoras = ('0' + horas).slice(-2);
    const formatoMinutos = ('0' + (minutos % 60)).slice(-2);
    const formatoSegundos = ('0' + (segundos % 60)).slice(-2);

    return `${formatoHoras}:${formatoMinutos}:${formatoSegundos}`;
  }

  openModal(content: TemplateRef<any>) {
    this.initMap();
    this.modalService.open(content, { size: 'lg',
    centered: true, 
    backdrop: 'static',
    keyboard: false});
  }

  finishTrip(stationId : string) {
    this.usoService.finishUse(stationId).subscribe(resp => {
      this.uso = resp;
      this.router.navigate(['use/trip/resume']);
    })
    this.detenerContador()
  }
}
