import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TiempoTranscurridoService {
    private contadorIniciadoSource = new Subject<boolean>();
    private contadorDetenidoSource = new Subject<boolean>();
    private fechaInicioSource = new Subject<Date>();
    private tiempoTranscurridoSource = new BehaviorSubject<string>('00:00:00');
    contadorIniciado$ = this.contadorIniciadoSource.asObservable();
    contadorDetenido$ = this.contadorDetenidoSource.asObservable();
    tiempoTranscurrido$ = this.tiempoTranscurridoSource.asObservable();
    fechaInicio$ = this.fechaInicioSource.asObservable();

    actualizarTiempoTranscurrido(tiempo: string) {
        this.tiempoTranscurridoSource.next(tiempo);
    }

    obtenerFecha(fecha: Date) {
        this.fechaInicioSource.next(fecha);
    }

    iniciarContador() {
        this.contadorIniciadoSource.next(true);
    }

    detenerContador() {
        this.contadorDetenidoSource.next(true);
    }
}